import os
import time
import uuid
import base64
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
Ты — научный руководитель и эксперт по проверке выпускных квалификационных работ (ВКР).

Проанализируй текст дипломной работы и подготовь подробный экспертный отчёт.

Критерии анализа:

1. Структура ВКР
Работа должна содержать:
- Введение
- Глава 1 — обзор литературы
- Глава 2 — собственные исследования
- Глава 3 — обсуждение результатов
- Заключение
- Список литературы
- Приложения (если есть)

2. Введение
Проверь наличие:
- актуальности
- степени разработанности темы
- цели
- задач исследования

3. Теоретическая часть
Наличие обзора литературы и анализа существующих решений.

4. Практическая часть
Методы исследования, эксперименты, результаты.

5. Обсуждение результатов
Сравнение с существующими решениями.

6. Заключение
Итоговые выводы и ответы на задачи исследования.

7. Научный стиль
- отсутствие разговорной речи
- отсутствие местоимения "я"
- логичность текста

Сформируй отчёт:

1. Краткое резюме
2. Анализ структуры
3. Оценка научного стиля
4. Анализ введения
5. Анализ теоретической части
6. Анализ практической части
7. Анализ выводов
8. Обнаруженные ошибки
9. Предложения по исправлению
10. Итоговая оценка по шкале 0–10
"""

def build_prompt(text: str, local_signals: dict | None = None) -> str:
    excerpt = text[:18000]

    signals_block = ""
    if local_signals:
        signals_block = "\n\nЛокальные сигналы анализа:\n" + str(local_signals)

    return (
        SYSTEM_PROMPT
        + signals_block
        + "\n\nТекст ВКР:\n"
        + excerpt
    )

def generate_report(text: str, local_signals: dict | None = None) -> str:
    token = get_access_token()

    model = os.getenv("GIGACHAT_MODEL", "GigaChat")
    max_tokens = int(os.getenv("GIGACHAT_MAX_TOKENS", "1800"))
    temperature = float(os.getenv("GIGACHAT_TEMPERATURE", "0.3"))

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": text[:18000]}
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
