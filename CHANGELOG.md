# Changelog

## [0.2.0] — 2026-05-01

### Ajouté
- **Système freemium** — 3 générations gratuites par jour, compteur AsyncStorage remis à zéro à minuit, paywall élégant avec boutons "Découvrir Premium" et "Revenir demain"
- **Bouton reset quota [dev]** — bouton discret en bas de l'accueil pour tester le freemium (à supprimer avant App Store)
- **utils/quota.ts** — module dédié à la gestion du quota journalier
- **Régime étendu** — 7 options : Omnivore, Végétarien, Vegan, Pesco-végétarien, Sans porc, Sans lactose, Sans gluten
- **Allergies multi-select** — 10 options cochables, "Aucune" exclusive (se désélectionne automatiquement si autre allergie cochée et réciproquement)
- **Ustensiles popup** — sélection multiple avec popup modal, persistance AsyncStorage, affichage du compteur
- **Flex-wrap chips** — les bulles Régime et Allergies s'affichent sur plusieurs lignes centrées, plus de scroll horizontal
- **Anti-doublon persistant** — les titres de recettes sauvegardées sont exclus en permanence des nouvelles générations
- **Section ingrédients dans recette** — les ingrédients avec quantités (scalées) apparaissent avant les étapes dans l'écran recette

### Modifié
- **Prompt Claude amélioré** — plat complet obligatoire (protéine + accompagnement varié), diversité culinaire, calibrage strict par niveau (Facile = 5-7 ingrédients supermarché, Moyen = 8-10, Chef = illimité)
- **Écran d'accueil** — nouveau sous-titre "De quoi avez-vous envie aujourd'hui ?", nouveau placeholder "Poulet, Saumon, Tofu..."
- **Cartes Mes recettes** — suppression de l'emoji poêle et du badge personnes ; nom aligné avec le bouton suppression
- **Pré-sélection personnes** — la popup de scaling sélectionne l'option la plus proche du nombre enregistré
- **Navigation** — suppression du bouton "Retour à l'accueil" sur tous les écrans (remplacé par la tab bar)
- **Écrans proposal et recipe** — suppression de l'emoji poêle en header

### Corrigé
- **PaywallModal** — rendu simultané avec l'écran d'erreur → le paywall a maintenant son propre bloc de rendu dédié
- **storage.ts** — JSON.parse sans try/catch → crash sur storage corrompu → fallback propre
- **claude.ts** — accès `data.content[0].text` sans vérification → crash sur réponse API inattendue → optional chaining + try/catch
- **claude.ts** — template literal du prompt fermé prématurément → l'instruction JSON n'était pas envoyée à Claude
- **saved.tsx** — cast `String(recipe.persons) as PersonsOption` → aucun bouton pré-sélectionné si persons ∉ {1,2,4,6+} → algorithme closest option
- **recipe.tsx** — style mort `recipeEmoji` supprimé

---

## [0.1.0] — 2026-04-30

### Ajouté
- **Flow complet** — Accueil → Préférences → Proposition → Recette
- **Navigation tabs** — Tab bar Accueil / Mes recettes avec Expo Router
- **Génération Claude** — Recettes générées en temps réel par Claude Haiku
- **Anti-doublon session** — historique des recettes proposées dans la session
- **Flow "Avec mes ingrédients"** — recette générée en forçant les ingrédients cochés
- **Sauvegarde recettes** — AsyncStorage avec suppression, scaling par personnes
- **Détection allergènes** — identification automatique dans chaque recette
- **Scaling quantités** — ajustement des quantités au nombre de personnes choisi
- **utils/scale.ts, utils/storage.ts, utils/quota.ts** — modules utilitaires
