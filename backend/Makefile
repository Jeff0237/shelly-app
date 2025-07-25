PYTHON=python3
VENV_DIR=venv
APP_MODULE=app:app
GUNICORN=$(VENV_DIR)/bin/gunicorn
LOG=gunicorn.log
PORT=9009

.PHONY: all init install run stop clean

all: init install run
	@echo "Gunicorn app initialized, dependencies installed, and running in background."

init:
	$(PYTHON) -m venv $(VENV_DIR)

install:
	$(VENV_DIR)/bin/pip install -r requirements.txt

run:
	nohup $(GUNICORN) --bind 0.0.0.0:$(PORT) $(APP_MODULE) > $(LOG) 2>&1 & echo $$! > app.pid
	@echo "Gunicorn started on port $(PORT) (PID in app.pid). Logs: $(LOG)"

stop:
	@echo "Stopping Gunicorn..."
	@if [ -f app.pid ]; then kill -9 $$(cat app.pid) && rm app.pid; else echo "App is not running."; fi

clean:
	rm -rf $(VENV_DIR) *.log *.pid

