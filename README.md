# 🔗 URL Shortener — Proyecto CI/CD

[![CI/CD](https://github.com/SamusCQ/url-shortener-cicd/actions/workflows/ci.yml/badge.svg)](https://github.com/SamusCQ/url-shortener-cicd/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=SamusCQ_url-shortener-cicd&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=SamusCQ_url-shortener-cicd)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=SamusCQ_url-shortener-cicd&metric=coverage)](https://sonarcloud.io/summary/new_code?id=SamusCQ_url-shortener-cicd)

Acortador de URLs construido para demostrar un **flujo CI/CD completo** con GitHub Actions,
Docker, SonarCloud y publicación de imágenes en GitHub Container Registry (ghcr.io).

## 🎯 ¿Qué hace?

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/urls` | Acorta una URL. Body: `{ "url": "https://..." }` |
| `GET`  | `/:shortCode` | Redirige (301) a la URL original y cuenta el clic |
| `GET`  | `/api/urls/:shortCode` | Devuelve metadatos (URL, clics, fecha) |
| `GET`  | `/health` | Health check |
| `GET`  | `/api-docs` | Documentación Swagger |

## 🛠️ Tecnologías

Node.js 20 · Express · PostgreSQL 16 · Docker / Docker Compose · Jest + Supertest ·
ESLint · GitHub Actions · SonarCloud · GitHub Container Registry.

## 🚀 Ejecutar en local

Requiere Docker.

```bash
docker compose up --build
```

La API queda en `http://localhost:3000`. Prueba rápida:

```bash
# Acortar una URL
curl -X POST http://localhost:3000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Usar el shortCode devuelto para redirigir
curl -i http://localhost:3000/<shortCode>
```

### Sin Docker (solo la app)

Necesitas un PostgreSQL accesible y la variable `DATABASE_URL`:

```bash
npm install
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/urlshortener"
npm start
```

## 🧪 Pruebas

```bash
npm test        # ejecuta Jest con cobertura
npm run lint    # ESLint
```

Las pruebas son de integración y requieren un PostgreSQL accesible vía `DATABASE_URL`
(en el pipeline lo provee el servicio `postgres` del job).

## 🔄 El pipeline CI/CD

Definido en [`.github/workflows/ci.yml`](.github/workflows/ci.yml). Se ejecuta en cada
**push a `main`** y en cada **Pull Request**:

```
push / PR
   │
   ├─ build-test   → npm ci · lint · tests + cobertura (con PostgreSQL real)
   │
   ├─ sonarcloud   → análisis estático + Quality Gate (bloquea si falla)
   │
   ├─ docker       → build y push de la imagen a ghcr.io   (solo main)
   │
   └─ deploy-smoke → levanta la imagen publicada + smoke test (solo main)
```

El job `deploy-smoke` levanta la imagen recién publicada con `docker-compose.deploy.yml`,
espera al `/health`, acorta una URL y verifica que la redirección devuelve **301**. Si algo
falla, el pipeline falla → despliegue verificado automáticamente.

## ⚙️ Configuración necesaria (una sola vez)

1. **SonarCloud**: crea una organización y un proyecto en <https://sonarcloud.io>, copia
   `organization` y `projectKey` a [`sonar-project.properties`](sonar-project.properties),
   y añade el secreto `SONAR_TOKEN` en *Settings → Secrets and variables → Actions*.
2. **ghcr.io**: no requiere secretos extra; usa el `GITHUB_TOKEN` automático.
3. **Branch protection** (recomendado): en *Settings → Branches* protege `main` exigiendo
   que el workflow CI/CD pase antes de hacer merge.
4. Los badges ya apuntan a `SamusCQ/url-shortener-cicd`. Si SonarCloud te asigna una
   `organization` o `projectKey` distintos al crear el proyecto, ajústalos en los badges
   de arriba y en [`sonar-project.properties`](sonar-project.properties).
