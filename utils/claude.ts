declare const process: { env: Record<string, string | undefined> };

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

export interface GeneratedRecipe {
  name: string;
  emoji: string;
  time: string;
  complexity: string;
  persons: number;
  ingredients: { id: string; name: string }[];
  steps: string[];
  allergens: string[];
}

interface RawRecipe {
  titre: string;
  temps: string;
  difficulté: string;
  personnes: number;
  ingrédients: string[];
  étapes: string[];
  allergènes: string[];
}

export async function generateRecipe(params: {
  ingredient: string;
  diet: string;
  allergy: string;
  ustensil: string;
  complexity: string;
  time: string;
  persons: string;
  exclude?: string[];
  mandatoryIngredients?: string[];
}): Promise<GeneratedRecipe> {
  if (!API_KEY) throw new Error('Clé API manquante — ajoute EXPO_PUBLIC_ANTHROPIC_API_KEY dans .env.local');

  const excludeNote = params.exclude?.length
    ? `\nRecettes déjà proposées à ne jamais reproduire (même nom ou recette similaire interdits) : ${params.exclude.join(', ')}.`
    : '';

  const mandatoryNote = params.mandatoryIngredients?.length
    ? `\nINGRÉDIENTS DE DÉPART (obligatoires) : L'utilisateur a sélectionné ces ingrédients : ${params.mandatoryIngredients.join(', ')}. Ils doivent obligatoirement apparaître dans la recette. Tu dois cependant ajouter tous les autres ingrédients complémentaires nécessaires pour que la recette soit complète, cohérente et appétissante. Ces ingrédients sont le point de départ, pas une limite.`
    : '';

const prompt = `Tu es un chef cuisinier passionné, créatif et pédagogue. Génère une recette unique, réaliste et appétissante basée sur ces paramètres :
- Ingrédient principal : ${params.ingredient}
- Complexité : ${params.complexity}
- Temps disponible : ${params.time}
- Pour : ${params.persons} personnes
- Régime : ${params.diet}
- Allergies : ${params.allergy}
- Ustensiles disponibles : ${params.ustensil}${excludeNote}${mandatoryNote}

Règles strictes :
- La recette doit être faisable exactement dans le temps indiqué
- Les quantités doivent être précises et réalistes pour le nombre de personnes
- Les étapes doivent être claires, courtes et dans le bon ordre
- Le titre doit être créatif, appétissant et faire maximum 5 mots
- Le titre s'écrit en français : majuscule uniquement au premier mot, tout le reste en minuscules
- Chaque recette doit être un plat complet avec une protéine ET un accompagnement varié (pas toujours riz ou pâtes — varier avec légumes rôtis, purée, quinoa, salade, pain, polenta, lentilles...)
- Varier les inspirations culinaires : cuisine française, italienne, asiatique, mexicaine, méditerranéenne, indienne... selon ce qui est cohérent avec l'ingrédient
- Ne pas systématiquement utiliser citron, miel, ail ou thym — chercher de la créativité et de la diversité dans les associations
- Calibrage complexité : Facile = débutant complet, techniques simples uniquement, ingrédients courants en supermarché classique, 5 à 7 ingrédients max ; Moyen = techniques intermédiaires (saisir, déglacer, réduire), 8 à 10 ingrédients max ; Chef = techniques avancées (émulsions, cuissons précises, dressage), ingrédients spécialisés autorisés
- Respecter strictement le régime et les allergies indiqués
- Utiliser uniquement les ustensiles disponibles indiqués
- Allergènes : identifier parmi cette liste ceux présents : Gluten, Lactose, Œufs, Fruits à coque, Arachides, Crustacés, Poisson, Soja, Sésame. Tableau vide si aucun.

Réponds uniquement en JSON avec cette structure exacte, sans markdown ni texte autour :
{
  "titre": "Nom créatif de la recette",
  "temps": "${params.time}",
  "difficulté": "${params.complexity}",
  "personnes": ${parseInt(params.persons) || 2},
  "ingrédients": ["200g de poulet", "1 citron"],
  "étapes": ["Étape 1.", "Étape 2."],
  "allergènes": ["Gluten"]
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Erreur API ${res.status}: ${body}`);
  }

  const data = await res.json();
  const text: string = data?.content?.[0]?.text;
  if (!text) throw new Error('Réponse invalide de Claude');

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Réponse invalide de Claude');

  let raw: RawRecipe;
  try {
    raw = JSON.parse(match[0]) as RawRecipe;
  } catch {
    throw new Error('Réponse invalide de Claude');
  }

  return {
    name: raw.titre,
    emoji: '🍳',
    time: raw.temps,
    complexity: raw.difficulté,
    persons: raw.personnes,
    ingredients: raw.ingrédients.map((name, i) => ({ id: String(i + 1), name })),
    steps: raw.étapes,
    allergens: raw.allergènes ?? [],
  };
}
