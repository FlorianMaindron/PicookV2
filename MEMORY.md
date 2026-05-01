# MEMORY — Picook V2

> Fichier de continuité entre sessions de développement.
> Mis à jour le : 2026-05-01

---

## État actuel du projet

**Version :** 0.2.0  
**Statut :** Fonctionnel, prêt pour les tests utilisateurs  
**Repo :** https://github.com/FlorianMaindron/PicookV2  
**Branche principale :** `main`

---

## Ce qui a été fait (session 2 — 2026-05-01)

### Fonctionnalités ajoutées
- Système freemium : 3 générations/jour, reset AsyncStorage à minuit, paywall modal
- Bouton dev `reset quota` (à retirer avant App Store)
- Régime : 7 options (ajout Pesco-végétarien, Sans porc, Sans lactose, Sans gluten)
- Allergies : 10 options, multi-select avec logique "Aucune" exclusive
- Ustensiles : popup multi-select, persistance AsyncStorage, affichage compteur
- Flex-wrap centré pour les chips (plus de scroll horizontal)
- Anti-doublon persistant : titres sauvegardés exclus des nouvelles générations
- Section ingrédients (avec quantités scalées) dans l'écran recette

### Prompt Claude amélioré
- Plat complet obligatoire (protéine + accompagnement varié — pas toujours riz/pâtes)
- Diversité culinaire (French, Italian, Asian, Mexican, Mediterranean, Indian)
- Pas d'ingrédients "par défaut" systématiques (citron, miel, ail, thym)
- Facile = 5-7 ingrédients supermarché classique uniquement
- Moyen = 8-10 ingrédients, Chef = illimité

### Bugs corrigés
- Template literal du prompt fermé prématurément → Claude ne recevait pas l'instruction JSON
- PaywallModal rendu en même temps que l'écran erreur
- `String(recipe.persons) as PersonsOption` → crash si persons ∉ {1,2,4,6+}
- `JSON.parse` sans try/catch dans storage.ts → crash sur storage corrompu
- `data.content[0].text` sans vérification → crash sur réponse API inattendue
- Style mort `recipeEmoji` dans recipe.tsx

### Supprimé
- Bouton "Retour à l'accueil" sur tous les écrans (tab bar suffit)
- Emoji poêle sur les écrans proposal, recipe, et cartes Mes recettes
- Badge "X pers." sur les cartes Mes recettes

---

## Architecture actuelle

```
app/
  _layout.tsx              Root Stack
  recipe.tsx               Écran recette (accessible depuis les 2 tabs)
  (tabs)/
    _layout.tsx            Tabs: (home) + saved
    saved.tsx              Mes recettes
    (home)/
      _layout.tsx          Stack: index → preferences → proposal
      index.tsx            Accueil
      preferences.tsx      Complexité / temps / personnes
      proposal.tsx         Recette proposée

utils/
  claude.ts                API Anthropic + prompt
  currentRecipe.ts         Store in-memory (bridge proposal→recipe)
  storage.ts               AsyncStorage (recettes + ustensiles)
  scale.ts                 Scaling quantités
  quota.ts                 Freemium quota journalier
```

---

## Tâches restantes & prochaines étapes

### Priorité haute (avant App Store)
- [ ] **Supprimer le bouton `⚙ reset quota [dev]`** dans `app/(tabs)/(home)/index.tsx` (lignes ~144-146)
- [ ] **Backend proxy** pour la clé API — actuellement `EXPO_PUBLIC_ANTHROPIC_API_KEY` est exposée côté client, décompilable. Prévoir un endpoint `/api/generate` avant toute mise en production publique.
- [ ] **Écran Premium** — le bouton "Découvrir Premium" ne fait rien pour l'instant (placeholder)
- [ ] **Onboarding** — expliquer le freemium à la première ouverture

### Priorité moyenne
- [ ] **Partager** depuis l'écran recette (le bouton existe, Share API câblée — à tester sur device physique)
- [ ] **Tests sur device physique** — vérifier le comportement AsyncStorage, le scaling, le freemium
- [ ] **Icône et splash screen** — assets Picook manquants (icône poêle orange)
- [ ] **Nom dans app.json** — encore "expo-boilerplate" ou similaire, à personaliser
- [ ] **Gestion offline** — actuellement pas de message si pas de connexion internet

### Priorité basse
- [ ] Passer l'ID recette de `Date.now()` à un vrai UUID (collision théorique sur même milliseconde)
- [ ] Ajouter une animation de transition sur le paywall
- [ ] Recherche/filtre dans Mes recettes si la liste devient longue

---

## Points de vigilance & dette technique

| Point | Description | Impact |
|-------|-------------|--------|
| 🔴 Clé API client | `EXPO_PUBLIC_ANTHROPIC_API_KEY` visible dans le bundle | Sécurité production |
| 🟠 currentRecipe.ts | Store in-memory perdu si l'app est kill en background | UX edge case |
| 🟠 Bouton dev | `reset quota [dev]` à supprimer avant publication | App Store review |
| 🟡 Modèle hardcodé | `claude-haiku-4-5-20251001` — à monitorer en cas de deprecation | Maintenabilité |
| 🟡 Regex scaling | Ne scale que les nombres, pas les fractions ou unités textuelles ("une pincée") | Qualité scaling |

---

## Décisions techniques importantes

- **recipe.tsx au niveau root** (pas dans `(home)`) : permet la navigation depuis les deux tabs sans problème de cross-tab navigation avec Expo Router
- **currentRecipe in-memory** : choix volontaire pour éviter la sérialisation JSON dans les URL params (recette complète trop lourde)
- **Primitives dans useCallback** : les params URL extraits en primitives avant le `useCallback` pour éviter les re-renders infinis
- **Quota en local uniquement** : le freemium est côté client — contournable (vider AsyncStorage). Acceptable en V2, à sécuriser côté backend en V3

---

## Commandes utiles

```bash
npx expo start          # Lancer le dev server
npx tsc --noEmit       # Vérifier TypeScript
git log --oneline      # Historique commits
```
