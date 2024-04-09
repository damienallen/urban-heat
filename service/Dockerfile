FROM python:3.12

ENV POETRY_VERSION=1.8.2
ENV POETRY_VIRTUALENVS_CREATE=false
ENV PATH /root/.local/bin:$PATH

RUN pip install pipx; pipx install poetry
WORKDIR /pysetup
COPY ./pyproject.toml ./poetry.lock* /pysetup/
RUN poetry install --only main