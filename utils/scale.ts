export function parsePersons(value: string): number {
  if (value === '6+') return 6;
  return parseInt(value, 10) || 2;
}

export function scaleIngredients(
  ingredients: { id: string; name: string }[],
  fromPersons: number,
  toPersons: number,
): { id: string; name: string }[] {
  if (fromPersons === toPersons) return ingredients;
  const factor = toPersons / fromPersons;
  return ingredients.map(ing => ({
    ...ing,
    name: ing.name.replace(/(\d+(?:[.,]\d+)?)(?!\s*°)/g, match => {
      const num = parseFloat(match.replace(',', '.'));
      const scaled = num * factor;
      if (Number.isInteger(scaled)) return String(scaled);
      return (Math.round(scaled * 10) / 10).toString().replace('.', ',');
    }),
  }));
}
