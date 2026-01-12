# 1️⃣ DESCRIPTION FONCTIONNELLE UNIQUE (MODERN CMS)

## 🎯 Vision du produit

Créer un **CMS de blog collaboratif headless**, inspiré de WordPress, avec :

- gestion d’articles
- édition multi-utilisateurs
- permissions granulaires
- tags & catégories
- rôles configurables
- API-first (REST)
- frontend moderne (SPA / SSR selon stack)

---

## 🧩 Modules fonctionnels

### 1. Authentification

- login / logout
- refresh token
- récupération du profil (`/me`)
- gestion de session sécurisée

---

### 2. Utilisateurs & Accès

- gestion des utilisateurs
- rôles configurables
- permissions granulaires (action-based)
- permissions effectives = rôles + permissions utilisateur

---

### 3. Articles (core)

- CRUD article
- statuts :

  - draft
  - in_review
  - published
  - archived

- auteur principal
- co-auteurs
- historique de modification
- preview

---

### 4. Édition collaborative

- verrouillage logique (1 éditeur actif)
- timeout de lock
- admin peut forcer le déverrouillage
- pas d’édition temps réel (pas de WebSocket pour ce test)

---

### 5. Tags & Catégories

- catégories hiérarchiques
- tags libres
- assignation multiple
- CRUD sécurisé

---

### 6. Permissions granulaires

Exemples :

```text
article.create
article.read
article.update.own
article.update.any
article.publish
article.archive

user.read
user.invite
user.assign_role

category.create
category.update
category.delete

tag.create
tag.update
tag.delete
```

---

### 7. Règle fondamentale

> Le frontend **suggère**,
> le backend **décide**.
