# 1️⃣ DESCRIPTION FONCTIONNELLE UNIQUE (MODERN CMS)

## 🎯 Vision du produit

Créer un **CMS de blog collaboratif headless**, inspiré de WordPress, avec :

* gestion d’articles
* édition multi-utilisateurs
* permissions granulaires
* tags & catégories
* rôles configurables
* API-first (REST)
* frontend moderne (SPA / SSR selon stack)

---

## 🧩 Modules fonctionnels

### 1. Authentification

* login / logout
* refresh token
* récupération du profil (`/me`)
* gestion de session sécurisée

---

### 2. Utilisateurs & Accès

* gestion des utilisateurs
* rôles configurables
* permissions granulaires (action-based)
* permissions effectives = rôles + permissions utilisateur

---

### 3. Articles (core)

* CRUD article
* statuts :

  * draft
  * in_review
  * published
  * archived
* auteur principal
* co-auteurs
* historique de modification
* preview

---

### 4. Édition collaborative

* verrouillage logique (1 éditeur actif)
* timeout de lock
* admin peut forcer le déverrouillage
* pas d’édition temps réel (pas de WebSocket pour ce test)

---

### 5. Tags & Catégories

* catégories hiérarchiques
* tags libres
* assignation multiple
* CRUD sécurisé

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


# 3️⃣ PROMPTS / INSTRUCTIONS PAR TECHNO

👉 Je ne répète **jamais** la partie fonctionnelle.
Chaque prompt **référence la description fonctionnelle ci-dessus**.

---

## 🧠 PROMPT COMMUN (À TOUJOURS METTRE AU DÉBUT)

> Tu dois implémenter **le CMS décrit dans la “Description fonctionnelle unique”**.
> Toute décision technique doit respecter cette description.
> Ne simplifie pas les règles métier.
> Le code doit être structuré, scalable et production-ready.

---

## 🔹 FRONTEND – VUE 3

### Prompt spécifique

> Implémente le frontend avec **Vue 3 + TypeScript + Axios + TanStack Query**.
>
> Contraintes :
>
> * architecture feature-based
> * aucun appel Axios dans les composants
> * TanStack Query = source de vérité
> * DTO + mapper pour l’API
> * permissions via `can(permission)`
> * aucune logique métier dans les composants
>
> Fournis :
>
> * structure de dossiers
> * module Articles complet
> * flow d’édition avec permissions

---

## 🔹 FRONTEND – NUXT 3

### Prompt spécifique

> Implémente le frontend avec **Nuxt 3**.
>
> Contraintes :
>
> * `$fetch` ou Nitro
> * TanStack Query pour la gestion des données
> * middleware Nuxt pour auth
> * layouts pour admin/public
> * composables pour permissions
>
> Fournis :
>
> * pages Articles
> * composables data
> * middleware auth & permissions

---

## 🔹 FRONTEND – REACT

### Prompt spécifique

> Implémente le frontend avec **React + TypeScript**.
>
> Contraintes :
>
> * TanStack Query obligatoire
> * Axios pour HTTP
> * React Router
> * architecture feature-based
> * hooks métiers séparés
>
> Fournis :
>
> * hooks Articles
> * composants d’édition
> * gestion permissions UI

---

## 🔹 FRONTEND – NEXT.JS

### Prompt spécifique

> Implémente le frontend avec **Next.js App Router**.
>
> Contraintes :
>
> * Server Components pour lecture
> * Client Components pour mutations
> * TanStack Query côté client
> * fetch natif
> * middleware auth
>
> Fournis :
>
> * pages Articles
> * mutation publish/edit
> * protection par permissions

---

## 🔸 BACKEND – EXPRESS + PRISMA

### Prompt spécifique

> Implémente le backend avec **Express + TypeScript + Prisma**.
>
> Contraintes :
>
> * REST API
> * JWT access + refresh
> * permissions granulaires
> * middleware auth & permissions
> * Prisma comme ORM
>
> Fournis :
>
> * schema Prisma
> * module Articles
> * middleware permissions
> * endpoint `/me`

---

## 🔸 BACKEND – SYMFONY

### Prompt spécifique

> Implémente le backend avec **Symfony**.
>
> Contraintes :
>
> * API REST
> * Security + Voters pour permissions
> * Doctrine ORM
> * DTO pour API
>
> Fournis :
>
> * entités principales
> * Voters permissions
> * contrôleurs Articles

---

## 🔸 BACKEND – LARAVEL

### Prompt spécifique

> Implémente le backend avec **Laravel**.
>
> Contraintes :
>
> * API REST
> * Policies & Gates
> * Eloquent ORM
> * Sanctum ou JWT
>
> Fournis :
>
> * models
> * policies
> * controllers Articles
> * endpoint `/me`

---

## 🔸 BACKEND – NEXT.JS (API)

### Prompt spécifique

> Implémente le backend avec **Next.js Route Handlers**.
>
> Contraintes :
>
> * Prisma
> * JWT
> * permissions middleware
> * API REST
>
> Fournis :
>
> * route handlers Articles
> * auth middleware
> * permissions check

---

# 4️⃣ CE QUE TU POURRAS COMPARER OBJECTIVEMENT

* complexité du code
* clarté des règles métier
* séparation des responsabilités
* DX (developer experience)
* facilité d’évolution
* duplication front/back
* vitesse d’implémentation IA

---

## Conclusion (très important)

Tu viens de définir **un benchmark sérieux**, pas un “hello world”.

👉 Même produit
👉 Même règles
👉 Plusieurs stacks
👉 Comparaison honnête

Si tu veux, prochaine étape possible :

* 📊 grille de comparaison objective
* 📁 repo mono vs multi
* 🤖 prompt “IA auto-correctrice”
* 🧪 critères d’évaluation du code généré par IA

Dis-moi.
