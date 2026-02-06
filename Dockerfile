#
# Python image for backend
#
FROM python:3.13-slim-trixie AS service
WORKDIR /service

RUN apt-get update && apt-get install -y build-essential

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
ENV VIRTUAL_ENV=/service/.venv \
    PATH="/service/.venv/bin:$PATH"

ADD README.md pyproject.toml uv.lock ./

RUN uv sync --frozen --no-install-project

# Copy and install service
ADD ./urban_heat ./urban_heat/
RUN uv sync --frozen

EXPOSE 8000
CMD ["granian", "--interface", "asgi", "--host", "0.0.0.0", "--port", "8000", "urban_heat.main:app"]


#
# Caddy image with baked in static and SPA
#
FROM node:24-trixie-slim AS static-builder
WORKDIR /app
ARG BUILD_MODE=production

COPY ./app/package.json ./app/package-lock.json /app/
RUN npm ci

COPY ./app /app/
RUN if [ "$BUILD_MODE" = "localdev" ]; then \
    npm run build:local; \
    else \
    npm run build; \
    fi

FROM caddy:2-alpine AS static
COPY --from=static-builder /app/dist /var/www
COPY Caddyfile /etc/caddy/Caddyfile
