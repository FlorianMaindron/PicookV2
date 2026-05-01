import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { getUstensils, saveUstensils, ALL_USTENSILS } from '@/utils/storage';

const DIETS = ['Omnivore', 'Végétarien', 'Vegan', 'Pesco-végétarien', 'Sans porc', 'Sans lactose', 'Sans gluten'];
const ALLERGIES = ['Aucune', 'Gluten', 'Lactose', 'Œufs', 'Fruits à coque', 'Arachides', 'Crustacés', 'Poisson', 'Soja', 'Sésame'];

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={onPress} activeOpacity={0.7}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function CheckRow({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity style={styles.checkRow} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        {checked ? <Text style={styles.checkmark}>✓</Text> : null}
      </View>
      <Text style={styles.checkRowLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [ingredient, setIngredient] = useState('');
  const [diet, setDiet] = useState('Omnivore');
  const [allergies, setAllergies] = useState<string[]>(['Aucune']);
  const [ustensils, setUstensils] = useState<string[]>(ALL_USTENSILS);
  const [showModal, setShowModal] = useState(false);
  const [modalSelection, setModalSelection] = useState<string[]>(ALL_USTENSILS);

  useEffect(() => {
    getUstensils().then(saved => setUstensils(saved));
  }, []);

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'Aucune') {
      setAllergies(['Aucune']);
    } else {
      setAllergies(prev => {
        const withoutAucune = prev.filter(a => a !== 'Aucune');
        if (withoutAucune.includes(allergy)) {
          const next = withoutAucune.filter(a => a !== allergy);
          return next.length === 0 ? ['Aucune'] : next;
        }
        return [...withoutAucune, allergy];
      });
    }
  };

  const toggleModalUstensil = (u: string) => {
    setModalSelection(prev => prev.includes(u) ? prev.filter(x => x !== u) : [...prev, u]);
  };

  const openModal = () => { setModalSelection([...ustensils]); setShowModal(true); };

  const confirmModal = async () => {
    setUstensils(modalSelection);
    await saveUstensils(modalSelection);
    setShowModal(false);
  };

  const ustensilesLabel =
    ustensils.length === ALL_USTENSILS.length
      ? 'Tous les ustensiles'
      : ustensils.length === 0
        ? 'Aucun ustensile'
        : `${ustensils.length} ustensile${ustensils.length > 1 ? 's' : ''}`;

  const handleNext = () => {
    if (!ingredient.trim()) return;
    const allergyParam = allergies.includes('Aucune') ? 'Aucune' : allergies.join(', ');
    const ustensileParam = ustensils.length === 0 ? 'Aucun ustensile' : ustensils.join(', ');
    router.push({
      pathname: '/preferences',
      params: { ingredient: ingredient.trim(), diet, allergy: allergyParam, ustensil: ustensileParam },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Picook 🍳</Text>
            <Text style={styles.subtitle}>De quoi avez-vous envie aujourd'hui ?</Text>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Poulet, Saumon, Tofu..."
              placeholderTextColor={Colors.textLight}
              value={ingredient}
              onChangeText={setIngredient}
              returnKeyType="next"
            />
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Régime</Text>
            <View style={styles.chipsWrap}>
              {DIETS.map(d => (
                <FilterChip key={d} label={d} selected={diet === d} onPress={() => setDiet(d)} />
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Allergies</Text>
            <View style={styles.chipsWrap}>
              {ALLERGIES.map(a => (
                <FilterChip key={a} label={a} selected={allergies.includes(a)} onPress={() => toggleAllergy(a)} />
              ))}
            </View>
          </View>

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Ustensiles</Text>
            <TouchableOpacity style={styles.ustensileButton} onPress={openModal} activeOpacity={0.8}>
              <Text style={styles.ustensileButtonText}>{ustensilesLabel}</Text>
              <Text style={styles.ustensileChevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !ingredient.trim() && styles.buttonDisabled]}
            onPress={handleNext}
            activeOpacity={0.85}
            disabled={!ingredient.trim()}
          >
            <Text style={styles.buttonText}>C'est parti →</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowModal(false)}>
          <TouchableOpacity style={styles.modal} activeOpacity={1}>
            <Text style={styles.modalTitle}>Vos ustensiles</Text>
            <Text style={styles.modalSubtitle}>Sélectionnez ce que vous avez à disposition.</Text>
            <View style={styles.checkList}>
              {ALL_USTENSILS.map(u => (
                <CheckRow key={u} label={u} checked={modalSelection.includes(u)} onToggle={() => toggleModalUstensil(u)} />
              ))}
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmModal} activeOpacity={0.85}>
              <Text style={styles.confirmBtnText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)} activeOpacity={0.6}>
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
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  header: { marginBottom: 32 },
  title: { fontSize: 44, fontWeight: '800', color: Colors.orange, letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 18, color: Colors.textSecondary, fontWeight: '400', lineHeight: 26 },
  inputWrapper: { marginBottom: 32 },
  input: {
    backgroundColor: Colors.white, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18,
    fontSize: 16, color: Colors.text, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  filterGroup: { marginBottom: 24 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 100, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  chipSelected: { backgroundColor: Colors.orangeLight, borderColor: Colors.orange },
  chipText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  chipTextSelected: { color: Colors.orange, fontWeight: '600' },
  ustensileButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1.5, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  ustensileButtonText: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  ustensileChevron: { fontSize: 22, color: Colors.textSecondary, lineHeight: 26 },
  spacer: { height: 16 },
  footer: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 32 : 24, paddingTop: 16, backgroundColor: Colors.cream },
  button: {
    backgroundColor: Colors.orange, borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { backgroundColor: Colors.border, shadowOpacity: 0, elevation: 0 },
  buttonText: { color: Colors.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: Colors.white, borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, textAlign: 'center', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  checkList: { gap: 2, marginBottom: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 14 },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.cream, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: Colors.orange, borderColor: Colors.orange },
  checkmark: { color: Colors.white, fontSize: 13, fontWeight: '800' },
  checkRowLabel: { fontSize: 15, color: Colors.text, fontWeight: '400' },
  confirmBtn: {
    backgroundColor: Colors.orange, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.orange, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    marginBottom: 8,
  },
  confirmBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: { paddingVertical: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
});
