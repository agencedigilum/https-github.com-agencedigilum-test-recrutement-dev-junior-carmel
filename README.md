# Test Recrutement - Task Manager Application

Ce projet est une application de gestion de tâches avec authentification, composée de trois parties : une API backend, une application web frontend, et une application mobile.

## Architecture

- **API Backend** (NestJS + PostgreSQL + TypeORM + JWT) : Gère l'authentification, les utilisateurs et les tâches.
- **Application Web** (React + React Router + TanStack Query) : Interface web pour la gestion des tâches avec authentification.
- **Application Mobile** (Flutter) : Application mobile pour la gestion des tâches.

## Technologies Utilisées

### API
- NestJS
- TypeORM
- PostgreSQL
- JWT pour l'authentification
- Swagger pour la documentation API

### Web
- React
- React Router
- TanStack React Query
- Axios
- Framer Motion
- Tailwind CSS
- Lucide React

### Mobile
- Flutter
- Dio
- Shared Preferences
- Google Fonts

## Démarrage de l'Application

### Prérequis
- Docker et Docker Compose (pour l'API)
- Node.js (pour l'application web)
- Flutter SDK (pour l'application mobile)

### 1. API Backend
```bash
cd test-recrutement-api
docker compose up --build
```
L'API sera disponible sur `http://localhost:3000`.
La base de données PostgreSQL sur `localhost:5432` (utilisateur: `admin`, mot de passe: `secret`).

### 2. Application Web
```bash
cd test-recrutement-web-app
npm install
npm run dev
```
L'application web sera disponible sur `http://localhost:5173`.

### 3. Application Mobile
```bash
cd test-recrutement-mobile-app
flutter pub get
flutter run
```
Assurez-vous d'avoir un émulateur ou un appareil connecté.

## Utilisation

### Authentification
1. Inscrivez-vous avec une adresse email.
2. Confirmez votre email via le lien envoyé.
3. Connectez-vous avec vos identifiants.
4. Vous pouvez modifier votre profil, changer d'email ou de mot de passe.
5. En cas d'oubli de mot de passe, utilisez la fonctionnalité de récupération.

### Gestion des Tâches
Une fois authentifié :
- Consultez le dashboard des tâches avec pagination, filtres et recherche.
- Créez de nouvelles tâches.
- Éditez les tâches existantes.
- Supprimez des tâches.

### Endpoints API Principaux
- Auth : `/auth/*` (inscription, connexion, profil, etc.)
- Tâches : `/tasks` (CRUD avec authentification requise)

L'application web et mobile se connectent à l'API pour synchroniser les données.