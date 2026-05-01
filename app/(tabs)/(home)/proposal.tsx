import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { generateRecipe, type GeneratedRecipe } from '@/utils/claude';
import { setCurrentRecipe } from '@/utils/currentRecipe';

function Checkbox({ checked, onPress }: { checked: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.checkbox, checked && styles.checkboxChecked]} onPress={onPress} activeOpacity={0.7}>
      {checked ? <Text style={styles.checkmark}>✓</Text> : null}
    </TouchableOpacity>
  );
}

export default function ProposalScreen() {
  const params = useLocalSearchParams<{
    ingredient: string; diet: string; allergy: string; ustensil: string;
    complexity: string; time: string; persons: string;
  }>();

  const ingredient = params.ingredient ?? '';
  const diet = params.diet ?? 'Omnivore';
  const allergy = params.allergy ?? 'Aucune';
  const ustensil = params.ustensil ?? 'Tout';
  const complexity = params.complexity ?? 'Facile';
  const time = params.time ?? '30min';
  const persons = params.persons ?? '2';

  const [recipe, setRecipe] = useState<GeneratedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [shown, setShown] = useState<string[]>([]);
  const [noCheckedWarning, setNoCheckedWarning] = useState(false);

  const fetchRecipe = useCallback(async (options: { exclude?: string[]; mandatory?: string[] } = {}) => {
    setLoading(true);
    setError(null);
    setChecked(new Set());
    setNoCheckedWarning(false);
    try {
      const result = await generateRecipe({
        ingredient, diet, allergy, ustensil, complexity, time, persons,
        exclude: options.exclude,
        mandatoryIngredients: options.mandatory,
      });
      setRecipe(result);
      setShown(prev => [...prev, result.name]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [ingredient, diet, allergy, ustensil, complexity, time, persons]);

  useEffect(() => { fetchRecipe(); }, [fetchRecipe]);

  const toggle = (id: string) => {
    setNoCheckedWarning(false);
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleNewRecipe = () => fetchRecipe({ exclude: shown });

  const handleWithIngredients = () => {
    if (checked.size === 0) { setNoCheckedWarning(true); return; }
    const mandatory = recipe!.ingredients.filter(ing => checked.has(ing.id)).map(ing => ing.name);
    fetchRecipe({ exclude: shown, mandatory });
  };

  const handleCook = () => {
    if (!recipe) return;
    setCurrentRecipe(recipe);
    router.push('/recipe');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBack}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingState}>
          <Text style={styles.loadingEmoji}>🍳</Text>
          <Text style={styles.loadingTitle}>On mijote votre recette...</Text>
          <Text style={styles.loadingSubtitle}>Picook est aux fourneaux !</Text>
          <ActivityIndicator color={Colors.orange} size="large" style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBack}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingState}>
          <Text style={styles.loadingEmoji}>😕</Text>
          <Text style={styles.loadingTitle}>Oups, une erreur</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchRecipe()} activeOpacity={0.85}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <View style={styles.recipeMeta}>
          <Text style={styles.recipeEmoji}>{recipe.emoji}</Text>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={styles.badges}>
            <View style={styles.badge}><Text style={styles.badgeText}>⏱ {recipe.time}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>👨‍🍳 {recipe.complexity}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>👥 {recipe.persons} pers.</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ingrédients</Text>
          {recipe.ingredients.map((ing, i) => (
            <TouchableOpacity
              key={ing.id}
              style={[styles.row, i === recipe.ingredients.length - 1 && styles.rowLast]}
              onPress={() => toggle(ing.id)}
              activeOpacity={0.7}
            >
              <Checkbox checked={checked.has(ing.id)} onPress={() => toggle(ing.id)} />
              <Text style={[styles.ingName, checked.has(ing.id) && styles.ingChecked]}>{ing.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleCook} activeOpacity={0.85}>
          <Text style={styles.buttonPrimaryText}>C'est parti, je cuisine ! →</Text>
        </TouchableOpacity>

        <View>
          <TouchableOpacity style={styles.buttonSecondary} onPress={handleWithIngredients} activeOpacity={0.85}>
            <Text style={styles.buttonSecondaryText}>Avec mes ingrédients 🎯</Text>
          </TouchableOpacity>
          {noCheckedWarning && <Text style={styles.warning}>Coche au moins un ingrédient</Text>}
        </View>

        <TouchableOpacity style={styles.buttonGhost} onPress={handleNewRecipe} activeOpacity={0.7}>
          <Text style={styles.buttonGhostText}>Nouvelle recette 🔄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeLink} onPress={() => router.navigate('/')} activeOpacity={0.6}>
          <Text style={styles.homeLinkText}>Retour à l'accueil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  loadingBack: { paddingHorizontal: 24, paddingTop: 24 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 8 },
  loadingEmoji: { fontSize: 56, marginBottom: 8 },
  loadingTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  loadingSubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center' },
  errorMessage: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  retryButton: { marginTop: 16, backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  retryText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  back: { marginBottom: 28 },
  backText: { fontSize: 16, color: Colors.orange, fontWeight: '600' },
  recipeMeta: { marginBottom: 28 },
  recipeEmoji: { fontSize: 52, marginBottom: 14 },
  recipeName: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginBottom: 16, lineHeight: 34 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: Colors.border },
  badgeText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 14 },
  rowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream, flexShrink: 0 },
  checkboxChecked: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  checkmark: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  ingName: { flex: 1, fontSize: 15, color: Colors.text, fontWeight: '400' },
  ingChecked: { color: Colors.textLight, textDecorationLine: 'line-through' },
  spacer: { height: 16 },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: Colors.cream, gap: 10 },
  buttonPrimary: {
    backgroundColor: Colors.orange, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  buttonPrimaryText: { color: Colors.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  buttonSecondary: { backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  buttonSecondaryText: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  warning: { textAlign: 'center', fontSize: 13, color: Colors.orange, fontWeight: '500', marginTop: 6 },
  buttonGhost: { paddingVertical: 12, alignItems: 'center' },
  buttonGhostText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '500' },
  homeLink: { paddingVertical: 6, alignItems: 'center' },
  homeLinkText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '400' },
});
