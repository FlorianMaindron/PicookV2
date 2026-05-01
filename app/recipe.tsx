import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Share,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getCurrentRecipe } from '@/utils/currentRecipe';
import { saveRecipe } from '@/utils/storage';

function StepItem({ number, text, checked, onPress }: { number: number; text: string; checked: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.stepRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.stepBullet, checked && styles.stepBulletChecked]}>
        <Text style={[styles.stepBulletText, checked && styles.stepBulletTextChecked]}>{checked ? '✓' : number}</Text>
      </View>
      <Text style={[styles.stepText, checked && styles.stepTextChecked]}>{text}</Text>
    </TouchableOpacity>
  );
}

export default function RecipeScreen() {
  const recipe = getCurrentRecipe();
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorState}>
          <Text style={styles.errorText}>Recette introuvable 😕</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggle = (index: number) => {
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index); else next.add(index);
      return next;
    });
  };

  const progress = checkedSteps.size;
  const total = recipe.steps.length;
  const allDone = progress === total;

  const handleSave = async () => {
    if (isSaved || saving) return;
    setSaving(true);
    try {
      await saveRecipe(recipe);
      setIsSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const ingList = recipe.ingredients.map(i => `• ${i.name}`).join('\n');
      const stepList = recipe.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
      await Share.share({
        message: `🍳 ${recipe.name}\n\nIngrédients :\n${ingList}\n\nÉtapes :\n${stepList}\n\nPartagé depuis Picook`,
        title: recipe.name,
      });
    } catch {
      // user dismissed share sheet
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <View style={styles.recipeHeader}>
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
            <View key={ing.id} style={[styles.ingRow, i === recipe.ingredients.length - 1 && styles.ingRowLast]}>
              <Text style={styles.ingDot}>·</Text>
              <Text style={styles.ingText}>{ing.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(progress / total) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{allDone ? '🎉 Terminé !' : `${progress}/${total} étapes`}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Étapes</Text>
          {recipe.steps.map((step, i) => (
            <StepItem key={i} number={i + 1} text={step} checked={checkedSteps.has(i)} onPress={() => toggle(i)} />
          ))}
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.buttonPrimary, (isSaved || saving) && styles.buttonSaved]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={isSaved || saving}
        >
          <Text style={styles.buttonPrimaryText}>
            {isSaved ? 'Sauvegardée ✓' : saving ? 'Sauvegarde...' : 'Sauvegarder ❤️'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={handleShare} activeOpacity={0.85}>
          <Text style={styles.buttonSecondaryText}>Partager</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  errorText: { fontSize: 18, color: Colors.textSecondary },
  back: { marginBottom: 28 },
  backText: { fontSize: 16, color: Colors.orange, fontWeight: '600' },
  recipeHeader: { marginBottom: 24 },
  recipeName: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginBottom: 16, lineHeight: 34 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, borderWidth: 1, borderColor: Colors.border },
  badgeText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  ingRow: { flexDirection: 'row', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'flex-start' },
  ingRowLast: { borderBottomWidth: 0, paddingBottom: 0 },
  ingDot: { fontSize: 18, color: Colors.orange, lineHeight: 22, marginTop: 1 },
  ingText: { flex: 1, fontSize: 15, color: Colors.text, lineHeight: 22 },
  progressSection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, marginBottom: 20 },
  progressBar: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 100, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.orange, borderRadius: 100 },
  progressLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', minWidth: 70, textAlign: 'right' },
  card: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 },
  stepRow: { flexDirection: 'row', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, alignItems: 'flex-start' },
  stepBullet: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.orangeLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  stepBulletChecked: { backgroundColor: Colors.orange },
  stepBulletText: { fontSize: 12, fontWeight: '700', color: Colors.orange },
  stepBulletTextChecked: { color: Colors.white },
  stepText: { flex: 1, fontSize: 15, color: Colors.text, lineHeight: 23 },
  stepTextChecked: { color: Colors.textLight, textDecorationLine: 'line-through' },
  spacer: { height: 16 },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: Colors.cream, gap: 10 },
  buttonPrimary: {
    backgroundColor: Colors.orange, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  buttonSaved: { backgroundColor: Colors.textLight, shadowOpacity: 0, elevation: 0 },
  buttonPrimaryText: { color: Colors.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  buttonSecondary: { backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 18, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  buttonSecondaryText: { color: Colors.text, fontSize: 17, fontWeight: '600' },
});
