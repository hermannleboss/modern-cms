# FRONTEND – VUE 3

## 🧠 PROMPT COMMUN

Tu dois implémenter **le CMS décrit dans la "Description fonctionnelle unique"**.
Toute décision technique doit respecter cette description.
Ne simplifie pas les règles métier.
Le code doit être structuré, scalable et production-ready.

---

## 🔹 PROMPT SPÉCIFIQUE – VUE 3

Implémente le frontend avec **Vue 3 + TypeScript + Axios + TanStack Query**.

### Contraintes

- architecture feature-based
- aucun appel Axios dans les composants
- TanStack Query = source de vérité
- DTO + mapper pour l'API
- permissions via `can(permission)`
- aucune logique métier dans les composants

### À fournir

- structure de dossiers
- module Articles complet
- flow d'édition avec permissions

> Tu dois implémenter le projet décrit dans la **Description fonctionnelle unique** fournie.
>
> **Étape 1 – Implémentation**
>
> - Génère le code complet demandé.
> - Respecte strictement les contraintes techniques.
>
> **Étape 2 – Auto-review critique**
> Analyse ton propre code comme un **reviewer senior** et identifie :
>
> - violations d’architecture
> - problèmes de sécurité
> - duplications inutiles
> - logique métier mal placée
> - couplage excessif
>
> **Étape 3 – Correction**
>
> - Corrige les problèmes identifiés
> - Refactor si nécessaire
>
> **Étape 4 – Justification**
>
> - Explique brièvement les décisions finales
> - Liste les compromis et limites
>
> ⚠️ Interdictions :
>
> - ne pas simplifier les règles métier
> - ne pas ignorer les permissions
> - ne pas déplacer la sécurité côté frontend
>
> 🎯 Objectif : produire un code **production-ready**, maintenable par une équipe senior.
