FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

ENV PYTHONPATH=/app
ENV FLASK_APP=src.app

# Use PORT env variable, default to 9000
ENV PORT=9000

EXPOSE ${PORT}

CMD ["flask", "run", "--host=0.0.0.0", "--port=${PORT}"] 
