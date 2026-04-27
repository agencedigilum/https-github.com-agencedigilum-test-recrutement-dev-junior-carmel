# API Task Manager (NestJS)

Backend NestJS + PostgreSQL + TypeORM + JWT.

## Démarrage Docker (recommandé)

```bash
docker compose up --build
```

Au démarrage, PostgreSQL et l'API se lancent ensemble.

- API : `http://localhost:3000`
- DB : `localhost:5432` (`admin` / `secret`)

## Variables d'environnement

Le fichier `.env` est prêt pour le lancement local et Docker.

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EMAIL_SECRET`
- `APP_FRONTEND_URL`
- `APP_BACKEND_URL`

## Endpoints principaux

### Auth

- `POST /auth/verify-mail`
- `POST /auth/sign-up`
- `POST /auth/confirm-mail`
- `POST /auth/sign-in`
- `POST /auth/refresh-token`
- `GET /auth/profile`
- `PUT /auth/profile`
- `PUT /auth/change-mail`
- `PUT /auth/change-password`
- `POST /auth/forget-password`
- `PUT /auth/new-password`

### Tasks (auth requise)

- `GET /tasks` (pagination + filtres + recherche)
- `POST /tasks`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
