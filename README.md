# Picook 🍳

Application mobile de génération de recettes alimentée par l'IA Claude (Anthropic). Picook génère des recettes personnalisées en temps réel selon les ingrédients, régime, allergies, ustensiles et niveau de l'utilisateur.

## Fonctionnalités

- **Génération IA** — Recettes uniques générées par Claude Haiku en temps réel (aucune recette codée en dur)
- **Filtres complets** — Régime (7 options), allergies multi-select (10 options), ustensiles personnalisables
- **Flow complet** — Accueil → Préférences → Proposition → Recette avec étapes cochables
- **Freemium** — 3 générations gratuites/jour, compteur remis à zéro chaque nuit
- **Anti-doublon** — Jamais deux fois la même recette (session + recettes sauvegardées)
- **Mes recettes** — Sauvegarde persistante avec AsyncStorage, scaling des quantités par nombre de personnes
- **Allergènes** — Détection automatique sur chaque recette générée
- **Navigation** — Tab bar (Accueil / Mes recettes)

## Stack technique

- React Native + Expo SDK 54
- Expo Router v3 (file-based routing, tabs + stack imbriqués)
- TypeScript strict
- AsyncStorage pour la persistance locale
- Claude Haiku (`claude-haiku-4-5-20251001`) via API Anthropic

## Lancer le projet

```bash
npm install
npx expo start
```

## Configuration

Créer un fichier `.env.local` à la racine :

```
EXPO_PUBLIC_ANTHROPIC_API_KEY=sk-ant-...
```

> ⚠️ Ce fichier ne doit jamais être commité. Il est ignoré par `.gitignore`.

## Structure du projet

```
app/
  _layout.tsx              # Root Stack (tabs + recipe)
  recipe.tsx               # Écran recette complète (root level, accessible depuis les 2 tabs)
  (tabs)/
    _layout.tsx            # Tab bar (Accueil / Mes recettes)
    saved.tsx              # Mes recettes sauvegardées
    (home)/
      _layout.tsx          # Stack du flow de génération
      index.tsx            # Accueil — ingredient + filtres
      preferences.tsx      # Complexité, temps, personnes
      proposal.tsx         # Recette proposée + ingrédients cochables

utils/
  claude.ts               # Appel API Anthropic + prompt
  currentRecipe.ts        # Store in-memory pour passer la recette entre écrans
  storage.ts              # AsyncStorage — recettes sauvegardées + ustensiles
  scale.ts                # Scaling des quantités selon le nombre de personnes
  quota.ts                # Système freemium — quota journalier

constants/
  theme.ts                # Design tokens (couleurs)
```

## Notes de développement

- Un bouton `⚙ reset quota [dev]` est présent en bas de l'accueil pour tester le freemium. **À supprimer avant publication App Store.**
- La clé API est exposée côté client (contrainte Expo). Prévoir un backend proxy avant la mise en production.
