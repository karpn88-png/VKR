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

Если пользователь передал выбранные пункты проверки, оцени работу только по этим пунктам. Не добавляй отдельный анализ по невыбранным критериям.

Формат отчёта:

1. Краткое резюме
   Дай 4–6 предложений по выбранным пунктам проверки.

2. Выбранные пункты проверки
   Перечисли пункты, по которым выполнен анализ.

3. Детальный анализ по выбранным пунктам
   Для каждого выбранного пункта укажи:
   - статус: "хорошо", "частично", "проблемно", "не обнаружено";
   - что найдено в тексте;
   - что хорошо;
   - что слабо;
   - что нужно добавить или переписать;
   - конкретный пример улучшения формулировки, если это уместно.

4. Приоритетные замечания
   Составь список из 5–10 замечаний в порядке важности. Каждое замечание должно содержать: проблему, почему это важно, как исправить.

5. Рекомендации перед сдачей
   Дай конкретный чек-лист действий для студента.

6. Итоговая оценка
   Поставь оценку по шкале 0–10 и отдельно дай оценки только по выбранным критериям.
"""

CHECK_CRITERIA = [
    {
        "id": "structure",
        "title": "Соответствие типовой структуре ВКР",
        "instruction": "Проверь наличие и качество введения, обзора литературы, практической части, результатов, заключения, списка литературы и приложений.",
    },
    {
        "id": "introduction",
        "title": "Качество введения",
        "instruction": "Проверь актуальность, проблему, объект, предмет, цель, задачи, методы и практическую значимость.",
    },
    {
        "id": "theory",
        "title": "Качество теоретической части",
        "instruction": "Проверь обзор источников, сравнение существующих решений, глубину анализа и выводы по главе.",
    },
    {
        "id": "practice",
        "title": "Качество практической части",
        "instruction": "Проверь описание разработки или исследования, методику, данные, результаты и проверку результата.",
    },
    {
        "id": "goal_alignment",
        "title": "Связь цели, задач, глав и заключения",
        "instruction": "Проверь, согласованы ли цель, задачи, содержание глав, результаты и выводы.",
    },
    {
        "id": "style",
        "title": "Научный стиль и связность текста",
        "instruction": "Проверь научный стиль, логику, связность, терминологическую точность, повторы и разговорные формулировки.",
    },
    {
        "id": "conclusions",
        "title": "Полнота выводов и результатов",
        "instruction": "Проверь наличие конкретных результатов, ограничений, выводов по главам и итоговых выводов.",
    },
    {
        "id": "defense_risks",
        "title": "Риски для допуска к защите",
        "instruction": "Определи критичные недостатки, которые могут помешать допуску к защите.",
    },
]


def get_selected_criteria(selected_checks: list[str] | None = None) -> list[dict]:
    if not selected_checks:
        return CHECK_CRITERIA

    selected_ids = set(selected_checks)
    selected = [item for item in CHECK_CRITERIA if item["id"] in selected_ids]
    return selected or CHECK_CRITERIA


def build_criteria_block(selected_criteria: list[dict]) -> str:
    lines = ["\n\nВыбранные пользователем пункты проверки:"]
    for index, item in enumerate(selected_criteria, start=1):
        lines.append(f"{index}. {item['title']}: {item['instruction']}")
    return "\n".join(lines)


def build_prompt(
    text: str,
    local_signals: dict | None = None,
    selected_checks: list[str] | None = None,
) -> str:
    excerpt = text[:18000]
    selected_criteria = get_selected_criteria(selected_checks)

    signals_block = ""
    if local_signals:
        signals_block = (
            "\n\nЛокальные метрики автоматического анализа:\n"
            + json.dumps(local_signals, ensure_ascii=False, indent=2)
        )

    return (
        "Подготовь отчёт по переданному тексту. Используй только выбранные пункты проверки."
        + build_criteria_block(selected_criteria)
        + signals_block
        + "\n\nТекст ВКР для анализа:\n"
        + excerpt
    )

def generate_report(
    text: str,
    local_signals: dict | None = None,
    selected_checks: list[str] | None = None,
) -> str:
    token = get_access_token()

    model = os.getenv("GIGACHAT_MODEL", "GigaChat")
    max_tokens = int(os.getenv("GIGACHAT_MAX_TOKENS", "3200"))
    temperature = float(os.getenv("GIGACHAT_TEMPERATURE", "0.3"))

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(text, local_signals, selected_checks)}
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
