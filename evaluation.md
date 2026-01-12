# 1️⃣ C’est quoi un prompt **“IA auto-correctrice”** ?

Un prompt **IA auto-correctrice** est un prompt qui demande à l’IA de :

1. **Coder**
2. **S’auto-relire**
3. **S’auto-critiquer**
4. **Corriger son propre code**
5. **Justifier les décisions**

👉 Tu ne demandes plus _“génère du code”_
👉 Tu demandes _“génère → audite → améliore”_

C’est exactement ce que ferait un **senior + reviewer + tech lead**.

---

## 🔁 Cycle d’une IA auto-correctrice

```text
1. Génération initiale
2. Analyse critique (architecture, sécurité, règles métier)
3. Détection des erreurs / dettes techniques
4. Refactor / correction
5. Résumé des choix et limites
```

---

## 🧠 PROMPT GÉNÉRIQUE — IA AUTO-CORRECTRICE

👉 **Ce prompt est universel**, tu peux l’utiliser avec n’importe quelle techno.

---

### 🔹 PROMPT – IA AUTO-CORRECTRICE (À COPIER)

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

---

## Pourquoi ce prompt est puissant

- réduit les hallucinations
- force la cohérence
- expose les limites
- améliore la qualité moyenne du code IA
- rend les stacks comparables

---

# 2️⃣ GRILLE DE COMPARAISON OBJECTIVE (STACK & IA)

👉 Cette grille te permet de comparer :

- les technos
- **et la qualité du code généré par l’IA**

---

## 📊 GRILLE DE COMPARAISON (SCORE /5)

### 🧱 1. Architecture (20%)

| Critère                 | Description                        |
| ----------------------- | ---------------------------------- |
| Séparation des couches  | UI / domaine / data bien distincts |
| Modularité              | features isolées                   |
| Scalabilité             | facilité d’ajout de features       |
| Lisibilité              | structure claire                   |
| Respect des contraintes | prompt respecté                    |

---

### 🔐 2. Sécurité & Permissions (20%)

| Critère                   | Description                        |
| ------------------------- | ---------------------------------- |
| Auth correcte             | JWT / session                      |
| Permissions backend-first | pas de logique critique côté front |
| Granularité               | permissions atomiques              |
| Middleware / guards       | bien utilisés                      |
| Gestion des erreurs       | pas d’infos sensibles              |

---

### 🧠 3. Logique Métier (15%)

| Critère              | Description               |
| -------------------- | ------------------------- |
| Règles centralisées  | pas dispersées            |
| Gestion des statuts  | correcte                  |
| Collaboration        | lock / règles respectées  |
| Cohérence            | règles identiques partout |
| Facilité d’évolution | règles modifiables        |

---

### ⚛️ 4. Qualité du Code (15%)

| Critère         | Description         |
| --------------- | ------------------- |
| Lisibilité      | naming clair        |
| Duplication     | minimale            |
| Fonctions pures | quand nécessaire    |
| Commentaires    | utiles, pas verbeux |
| Typage          | strict (TS / PHP)   |

---

### 🚀 5. Developer Experience (10%)

| Critère                | Description             |
| ---------------------- | ----------------------- |
| Setup                  | facilité d’installation |
| Structure              | intuitive               |
| Documentation          | suffisante              |
| DX tooling             | lint, format            |
| Temps de prise en main | rapide                  |

---

### 🔄 6. Alignement Front / Back (10%)

| Critère               | Description            |
| --------------------- | ---------------------- |
| DTO cohérents         | front ↔ back           |
| Permissions synchro   | mêmes clés             |
| Endpoints clairs      | REST propre            |
| Erreurs standardisées | format commun          |
| Évolutivité           | changement API absorbé |

---

### 🤖 7. Qualité du code IA (10%)

| Critère                | Description    |
| ---------------------- | -------------- |
| Respect du prompt      | total          |
| Auto-correction réelle | pas cosmétique |
| Justification          | claire         |
| Compromis expliqués    | oui            |
| Limites identifiées    | honnêtes       |

---

## 🧮 Score final

> **Score total /100**
> Pondération appliquée automatiquement.

Tu peux comparer :

- Vue vs React
- Express vs Laravel
- IA vs humain
- SSR vs SPA
- même techno, prompts différents

---

# 3️⃣ CRITÈRES D’ÉVALUATION DU CODE GÉNÉRÉ PAR IA

👉 À utiliser **à froid**, après génération.

---

## ❌ Red flags (échec immédiat)

- `if (user.role === 'admin')`
- logique métier dans les composants
- sécurité uniquement côté frontend
- absence de permissions
- Axios dans les composants
- controllers trop gros
- absence de `/me`

---

## ✅ Signes de code senior

- fonctions `can()` centralisées
- règles métier isolées
- DTO + mapper
- erreurs explicites
- séparation feature/domain
- choix justifiés

---

## 🧪 Test ultime

Pose cette question à l’IA après génération :

> “Si je change complètement le frontend ou le backend, qu’est-ce qui casse et pourquoi ?”

Une bonne implémentation **sait répondre**.

---

# 4️⃣ Comment exploiter ça concrètement

### Méthode recommandée

1. même description fonctionnelle
2. même prompt auto-correcteur
3. stacks différentes
4. même grille de scoring
5. analyse écrite

👉 Tu obtiens **des résultats exploitables**, pas subjectifs.
