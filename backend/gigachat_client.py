import os
import time
import uuid
import base64
import json
import requests

OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
CHAT_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"

# На тестах иногда нужен verify=False, но лучше поставить сертификаты.
# Для простоты оставим verify=False (как в официальных примерах часто делают),
# но позже я покажу, как сделать правильно.
VERIFY_SSL = False

_token_cache = {"value": None, "expires_at": 0}


def _get_env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}")
    return v


def get_access_token() -> str:
    # кэш токена, чтобы не получать каждый раз
    now = int(time.time())
    if _token_cache["value"] and now < _token_cache["expires_at"] - 30:
        return _token_cache["value"]

    client_id = _get_env("GIGACHAT_CLIENT_ID")
    client_secret = _get_env("GIGACHAT_CLIENT_SECRET")

    credentials = f"{client_id}:{client_secret}"
    encoded = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")

    headers = {
        "Authorization": f"Basic {encoded}",
        "RqUID": str(uuid.uuid4()),
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
    }

    data = {"scope": "GIGACHAT_API_PERS"}

    r = requests.post(OAUTH_URL, headers=headers, data=data, timeout=30, verify=VERIFY_SSL)
    r.raise_for_status()
    j = r.json()

    token = j["access_token"]
    expires_in = int(j.get("expires_in", 600))
    _token_cache["value"] = token
    _token_cache["expires_at"] = now + expires_in

    return token

SYSTEM_PROMPT = """
Ты — строгий, но полезный научный руководитель и эксперт по проверке выпускных квалификационных работ.

Твоя задача — подготовить подробный экспертный отчёт по тексту ВКР. Пиши по-русски, профессионально и конкретно. Не выдумывай факты: если в предоставленном фрагменте нет нужного элемента, так и напиши "не обнаружено в переданном тексте".

Оцени работу по критериям:
- соответствие типовой структуре ВКР;
- качество введения: актуальность, проблема, объект, предмет, цель, задачи, методы, практическая значимость;
- качество теоретической части: обзор источников, сравнение существующих решений, выводы по главе;
- качество практической части: описание разработки/исследования, методика, данные, результаты, проверка результата;
- связь между целью, задачами, главами и заключением;
- научный стиль, логика, связность, терминологическая точность;
- полнота выводов, наличие конкретных результатов и ограничений;
- риски для допуска к защите.

Формат отчёта:

1. Краткое резюме
   Дай 4–6 предложений: общее качество, главные сильные стороны, главные проблемы.

2. Таблица проверки структуры
   Для каждого элемента укажи статус: "есть", "частично", "не обнаружено".
   Элементы: введение, обзор литературы, практическая часть, результаты, заключение, список литературы, приложения.
   Для каждого элемента добавь короткое пояснение, что именно найдено или чего не хватает.

3. Детальный анализ по разделам
   Разбери введение, теорию, практику, результаты, заключение.
   Для каждого раздела укажи:
   - что хорошо;
   - что слабо;
   - что нужно добавить или переписать.

4. Научный стиль и оформление текста
   Отметь разговорные формулировки, слабую аргументацию, повторы, неясные термины, отсутствие связок между абзацами.

5. Проверка цели и задач
   Скажи, согласованы ли цель, задачи, содержание глав и выводы. Если есть разрыв, объясни какой.

6. Приоритетные замечания
   Составь список из 5–10 замечаний в порядке важности. Каждое замечание должно содержать: проблему, почему это важно, как исправить.

7. Рекомендации перед сдачей
   Дай конкретный чек-лист действий для студента.

8. Итоговая оценка
   Поставь оценку по шкале 0–10 и отдельно дай оценки по критериям: структура, введение, теория, практика, выводы, стиль.
"""

def build_prompt(text: str, local_signals: dict | None = None) -> str:
    excerpt = text[:18000]

    signals_block = ""
    if local_signals:
        signals_block = (
            "\n\nЛокальные метрики автоматического анализа:\n"
            + json.dumps(local_signals, ensure_ascii=False, indent=2)
        )

    return (
        "Используй системные критерии проверки и подготовь отчёт по переданному тексту."
        + signals_block
        + "\n\nТекст ВКР для анализа:\n"
        + excerpt
    )

def generate_report(text: str, local_signals: dict | None = None) -> str:
    token = get_access_token()

    model = os.getenv("GIGACHAT_MODEL", "GigaChat")
    max_tokens = int(os.getenv("GIGACHAT_MAX_TOKENS", "3200"))
    temperature = float(os.getenv("GIGACHAT_TEMPERATURE", "0.3"))

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(text, local_signals)}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    r = requests.post(CHAT_URL, headers=headers, json=payload, timeout=120, verify=VERIFY_SSL)
    r.raise_for_status()
    j = r.json()

    # вытащим именно текст
    return j["choices"][0]["message"]["content"]
