# New Backend

Lightweight Django backend scaffold with Django REST Framework, PostgreSQL, Celery, and Redis.

## Stack

- Django
- Django REST Framework
- PostgreSQL
- Celery
- Redis

## Local setup

1. Copy `.env.example` to `.env` and adjust values.
2. Create a virtual environment and install dependencies from `pyproject.toml`.
3. Run database migrations.
4. Start the development server.

## Useful commands

```bash
python manage.py migrate
python manage.py runserver
celery -A config worker -l info
```

## Health endpoint

- `GET /api/health/`
