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
- Les quantités doivent être précises et réalistes
- Les étapes doivent être claires, courtes et dans le bon ordre
- Le titre doit être créatif, appétissant et faire maximum 5 mots
- Le titre s'écrit en français : majuscule uniquement au premier mot, tout le reste en minuscules
- Pas de recettes génériques ou banales
- Calibrage de la complexité : Facile = accessible à un débutant complet, techniques simples uniquement (pas de dorure, pas de déglaçage, pas de liaison) ; Moyen = quelques techniques intermédiaires (saisir, déglacer, réduire) ; Chef = techniques avancées réservées aux cuisiniers expérimentés (émulsions, cuissons précises, dressage). La recette doit vraiment correspondre au niveau demandé.
- Allergènes : identifie parmi cette liste ceux présents dans la recette : Gluten, Lactose, Œufs, Fruits à coque, Arachides, Crustacés, Poisson, Soja, Sésame. Liste uniquement ceux vraiment présents, tableau vide si aucun.

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
  const text: string = data.content[0].text;

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Réponse invalide de Claude');

  const raw = JSON.parse(match[0]) as RawRecipe;

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
