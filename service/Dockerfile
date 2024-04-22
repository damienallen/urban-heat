FROM python:3.12-alpine

ENV POETRY_VERSION=1.8.2
ENV POETRY_VIRTUALENVS_CREATE=false
ENV PATH /root/.local/bin:$PATH

RUN pip install pipx; pipx install poetry
WORKDIR /pysetup
COPY ../README.md ../pyproject.toml ../poetry.lock* /pysetup/
RUN poetry install --only main

WORKDIR /service
COPY . /service/

EXPOSE 8000
CMD ["uvicorn", "urban_heat.main:app", "--host", "0.0.0.0", "--port", "8000"]