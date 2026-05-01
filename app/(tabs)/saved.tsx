import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getSavedRecipes, deleteRecipe, type SavedRecipe } from '@/utils/storage';
import { setCurrentRecipe } from '@/utils/currentRecipe';
import { scaleIngredients, parsePersons } from '@/utils/scale';

const PERSONS_OPTIONS = ['1', '2', '4', '6+'] as const;
type PersonsOption = (typeof PERSONS_OPTIONS)[number];

function AllergenBadge({ label }: { label: string }) {
  return (
    <View style={styles.allergenBadge}>
      <Text style={styles.allergenText}>{label}</Text>
    </View>
  );
}

function RecipeCard({ recipe, onPress, onDelete }: { recipe: SavedRecipe; onPress: () => void; onDelete: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName} numberOfLines={2}>{recipe.name}</Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.cardBadges}>
        <View style={styles.badge}><Text style={styles.badgeText}>⏱ {recipe.time}</Text></View>
        <View style={styles.badge}><Text style={styles.badgeText}>👨‍🍳 {recipe.complexity}</Text></View>
      </View>
      {recipe.allergens.length > 0 && (
        <View style={styles.allergens}>
          {recipe.allergens.map(a => <AllergenBadge key={a} label={a} />)}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SavedScreen() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SavedRecipe | null>(null);
  const [selectedPersons, setSelectedPersons] = useState<PersonsOption>('2');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getSavedRecipes().then(data => {
        if (active) { setRecipes(data); setLoading(false); }
      });
      return () => { active = false; };
    }, [])
  );

  const handleDelete = async (id: string) => {
    await deleteRecipe(id);
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const handleCardPress = (recipe: SavedRecipe) => {
    const validOptions: PersonsOption[] = ['1', '2', '4', '6+'];
    const closest = validOptions.reduce((prev, curr) => {
      const prevN = parsePersons(prev);
      const currN = parsePersons(curr);
      return Math.abs(currN - recipe.persons) < Math.abs(prevN - recipe.persons) ? curr : prev;
    });
    setSelectedPersons(closest);
    setSelected(recipe);
  };

  const handleConfirm = () => {
    if (!selected) return;
    const toPersons = parsePersons(selectedPersons);
    const scaled = {
      ...selected,
      persons: toPersons,
      ingredients: scaleIngredients(selected.ingredients, selected.persons, toPersons),
    };
    setCurrentRecipe(scaled);
    setSelected(null);
    router.push('/recipe');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.orange} size="large" style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes recettes</Text>
        <Text style={styles.subtitle}>{recipes.length} recette{recipes.length !== 1 ? 's' : ''} sauvegardée{recipes.length !== 1 ? 's' : ''}</Text>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>Rien ici pour l'instant</Text>
          <Text style={styles.emptySubtitle}>Génère une recette et sauvegarde-la pour la retrouver ici !</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {recipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onPress={() => handleCardPress(recipe)}
              onDelete={() => handleDelete(recipe.id)}
            />
          ))}
        </ScrollView>
      )}

      <Modal visible={selected !== null} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setSelected(null)}>
          <TouchableOpacity style={styles.modal} activeOpacity={1}>
            <Text style={styles.modalTitle}>Pour combien de personnes ?</Text>
            <Text style={styles.modalSubtitle}>Les quantités seront ajustées automatiquement.</Text>
            <View style={styles.personsRow}>
              {PERSONS_OPTIONS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.personBtn, selectedPersons === p && styles.personBtnSelected]}
                  onPress={() => setSelectedPersons(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.personBtnText, selectedPersons === p && styles.personBtnTextSelected]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Voir la recette →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelected(null)} activeOpacity={0.6}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary },
  scroll: { paddingHorizontal: 24, paddingBottom: 24, gap: 14 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 10 },
  emptyEmoji: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  emptySubtitle: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  card: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  deleteBtn: { padding: 4, paddingTop: 2 },
  deleteBtnText: { fontSize: 14, color: Colors.textLight, fontWeight: '600' },
  cardName: { flex: 1, fontSize: 18, fontWeight: '700', color: Colors.text, lineHeight: 24 },
  cardBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 },
  badge: { backgroundColor: Colors.cream, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: Colors.border },
  badgeText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  allergens: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  allergenBadge: { backgroundColor: '#FFF0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1, borderColor: '#FFCCCC' },
  allergenText: { fontSize: 12, color: '#C0392B', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: Colors.white, borderRadius: 24, padding: 28, width: '100%', maxWidth: 340 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 6 },
  modalSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  personsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  personBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center',
    backgroundColor: Colors.cream, borderWidth: 1.5, borderColor: Colors.border,
  },
  personBtnSelected: { backgroundColor: Colors.orangeLight, borderColor: Colors.orange },
  personBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  personBtnTextSelected: { color: Colors.orange },
  confirmBtn: {
    backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    marginBottom: 10,
  },
  confirmBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: { paddingVertical: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
});
