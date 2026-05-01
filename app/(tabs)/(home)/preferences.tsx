import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';

type Complexity = 'Facile' | 'Moyen' | 'Chef';
type TimeFilter = '15min' | '30min' | '1h+';
type Persons = '1' | '2' | '4' | '6+';

const COMPLEXITY: { value: Complexity; emoji: string; label: string }[] = [
  { value: 'Facile', emoji: '🙂', label: 'Facile' },
  { value: 'Moyen', emoji: '🤔', label: 'Moyen' },
  { value: 'Chef', emoji: '👨‍🍳', label: 'Chef' },
];
const TIMES: { value: TimeFilter; emoji: string; label: string }[] = [
  { value: '15min', emoji: '⚡', label: '15 min' },
  { value: '30min', emoji: '🕐', label: '30 min' },
  { value: '1h+', emoji: '☕', label: '1h ou +' },
];
const PERSONS: { value: Persons; label: string }[] = [
  { value: '1', label: '1' }, { value: '2', label: '2' },
  { value: '4', label: '4' }, { value: '6+', label: '6+' },
];

function OptionCard({ label, emoji, selected, onPress }: { label: string; emoji?: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.card, selected && styles.cardSelected]} onPress={onPress} activeOpacity={0.8}>
      {emoji ? <Text style={styles.cardEmoji}>{emoji}</Text> : null}
      <Text style={[styles.cardLabel, selected && styles.cardLabelSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function PreferencesScreen() {
  const params = useLocalSearchParams<{ ingredient: string; diet: string; allergy: string; ustensil: string }>();
  const [complexity, setComplexity] = useState<Complexity>('Facile');
  const [time, setTime] = useState<TimeFilter>('30min');
  const [persons, setPersons] = useState<Persons>('2');

  const handleNext = () => {
    router.push({ pathname: '/proposal', params: { ...params, complexity, time, persons } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Vos préférences</Text>
          <Text style={styles.subtitle}>Pour "{params.ingredient}", on affine encore un peu !</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Complexité</Text>
          <View style={styles.cardRow}>
            {COMPLEXITY.map(opt => (
              <OptionCard key={opt.value} label={opt.label} emoji={opt.emoji} selected={complexity === opt.value} onPress={() => setComplexity(opt.value)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Temps de préparation</Text>
          <View style={styles.cardRow}>
            {TIMES.map(opt => (
              <OptionCard key={opt.value} label={opt.label} emoji={opt.emoji} selected={time === opt.value} onPress={() => setTime(opt.value)} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nombre de personnes</Text>
          <View style={styles.cardRow}>
            {PERSONS.map(opt => (
              <OptionCard key={opt.value} label={opt.label} selected={persons === opt.value} onPress={() => setPersons(opt.value)} />
            ))}
          </View>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Voir une recette →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  back: { marginBottom: 28 },
  backText: { fontSize: 16, color: Colors.orange, fontWeight: '600' },
  header: { marginBottom: 36 },
  title: { fontSize: 30, fontWeight: '800', color: Colors.text, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 16, color: Colors.textSecondary, lineHeight: 24 },
  section: { marginBottom: 28 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  cardRow: { flexDirection: 'row', gap: 10 },
  card: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardSelected: { backgroundColor: Colors.orangeLight, borderColor: Colors.orange, shadowOpacity: 0, elevation: 0 },
  cardEmoji: { fontSize: 24 },
  cardLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  cardLabelSelected: { color: Colors.orange },
  spacer: { height: 16 },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: Colors.cream },
  button: {
    backgroundColor: Colors.orange, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  buttonText: { color: Colors.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});
