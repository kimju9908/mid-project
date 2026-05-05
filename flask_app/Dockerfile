FROM python:3.10

WORKDIR /app

COPY requirements.txt .

# pip 먼저 최신화 (이게 핵심)
RUN pip install --upgrade pip setuptools wheel

RUN pip install -r requirements.txt

COPY . .

CMD ["python", "app.py"]