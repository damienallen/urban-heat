FROM python:3.12

ENV POETRY_VERSION=1.8.2
ENV POETRY_VIRTUALENVS_CREATE=false
ENV PATH /root/.local/bin:$PATH

RUN apt update; \
    apt install build-essential

RUN pip install pipx; pipx install poetry
WORKDIR /pysetup
COPY ./README.md ./pyproject.toml ./poetry.lock* /pysetup/
RUN poetry install

WORKDIR /service
COPY ./urban_heat /service/urban_heat/

EXPOSE 8000
CMD ["uvicorn", "urban_heat.main:app", "--host", "0.0.0.0", "--port", "8000"]