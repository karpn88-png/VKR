FROM python:3.10

WORKDIR /app
COPY . /app

# системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# базовые python-зависимости
RUN pip install --no-cache-dir "numpy<2"

# PyTorch CPU совместимый с новыми transformers (>=2.4)
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.4.0

# остальные зависимости
RUN pip install --no-cache-dir transformers sentence-transformers

# uvicorn + fastapi
RUN pip install --no-cache-dir uvicorn fastapi

EXPOSE 5000

CMD ["uvicorn", "ai_server:app", "--host", "0.0.0.0", "--port", "5000"]
