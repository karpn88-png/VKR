FROM python:3.10

WORKDIR /app
COPY requirements.txt /app/requirements.txt

# системные зависимости
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip

# PyTorch CPU. Остальные ML-библиотеки закреплены в requirements.txt.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.4.0

# FastAPI + SentenceTransformers stack with pinned compatible versions.
RUN pip install --no-cache-dir -r /app/requirements.txt

RUN python -c "import torch, transformers, sentence_transformers; print('AI deps:', torch.__version__, transformers.__version__, sentence_transformers.__version__)"

COPY . /app

EXPOSE 5000

CMD ["uvicorn", "ai_server:app", "--host", "0.0.0.0", "--port", "5000"]
