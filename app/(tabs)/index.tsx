import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { postJson } from '@/lib/api';
import { usePantry } from '@/lib/pantry';

type DetectedItem = {
  name: string;
  quantity?: string;
  category?: string;
  selected: boolean;
};

export default function PantryScreen() {
  const { items, hydrated, addItem, addMany, updateItem, removeItem } = usePantry();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [scanning, setScanning] = useState(false);

  function resetForm() {
    setName('');
    setQuantity('');
    setCategory('');
    setEditingId(null);
  }

  function saveItem() {
    if (!name.trim()) {
      Alert.alert('Add an ingredient', 'Give your pantry item a name first.');
      return;
    }
    const input = {
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      category: category.trim() || undefined,
    };
    if (editingId) {
      updateItem(editingId, input);
    } else {
      addItem(input);
    }
    resetForm();
  }

  function editItem(item: (typeof items)[number]) {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(item.quantity ?? '');
    setCategory(item.category ?? '');
  }

  async function pickAndScan(source: 'camera' | 'library') {
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Camera permission needed', 'Allow camera access to scan your pantry.');
          return;
        }
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.5,
              base64: true,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              quality: 0.5,
              base64: true,
            });
      const asset = result.canceled ? undefined : result.assets[0];
      if (!asset?.base64) {
        return;
      }
      setScanning(true);
      const response = await postJson<{
        items: Array<{ name: string; quantity?: string; category?: string }>;
      }>('/api/scan-pantry', {
        imageBase64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
      setDetected(response.items.map((item) => ({ ...item, selected: true })));
    } catch (error) {
      Alert.alert('Scan failed', error instanceof Error ? error.message : 'Try another photo.');
    } finally {
      setScanning(false);
    }
  }

  function addDetected() {
    addMany(
      detected
        .filter((item) => item.selected)
        .map(({ selected: _selected, ...item }) => item),
    );
    setDetected([]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>YOUR KITCHEN, IN ONE PLACE</Text>
        <Text style={styles.title}>Pantry</Text>
        <Text style={styles.subtitle}>Tell CookFood what you have. We’ll handle the rest.</Text>

        <View style={styles.scanCard}>
          <View style={styles.scanCopy}>
            <Text style={styles.scanTitle}>See what’s on hand</Text>
            <Text style={styles.cardText}>Snap a shelf or choose a photo. You review every result.</Text>
          </View>
          <View style={styles.row}>
            <Pressable style={styles.secondaryButton} onPress={() => void pickAndScan('camera')}>
              <Text style={styles.secondaryButtonText}>Camera</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => void pickAndScan('library')}>
              <Text style={styles.secondaryButtonText}>Photo library</Text>
            </Pressable>
          </View>
          {scanning && <Text style={styles.status}>Reading your photo…</Text>}
        </View>

        {detected.length > 0 && (
          <View style={styles.reviewCard}>
            <Text style={styles.cardTitle}>Review detected items</Text>
            {detected.map((item, index) => (
              <Pressable
                key={`${item.name}-${index}`}
                style={styles.detectedRow}
                onPress={() =>
                  setDetected((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, selected: !entry.selected } : entry,
                    ),
                  )
                }>
                <Text style={[styles.check, !item.selected && styles.unchecked]}>
                  {item.selected ? '✓' : ''}
                </Text>
                <Text style={styles.ingredientName}>{item.name}</Text>
                <Text style={styles.muted}>{item.quantity ?? ''}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.primaryButton} onPress={addDetected}>
              <Text style={styles.primaryButtonText}>Add selected to pantry</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>{editingId ? 'Edit ingredient' : 'Add an ingredient'}</Text>
          <TextInput
            placeholder="Ingredient name"
            placeholderTextColor="#9B9184"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Quantity"
              placeholderTextColor="#9B9184"
              value={quantity}
              onChangeText={setQuantity}
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              placeholder="Category"
              placeholderTextColor="#9B9184"
              value={category}
              onChangeText={setCategory}
              style={[styles.input, styles.halfInput]}
            />
          </View>
          <View style={styles.row}>
            <Pressable style={styles.primaryButton} onPress={saveItem}>
              <Text style={styles.primaryButtonText}>{editingId ? 'Save changes' : 'Add to pantry'}</Text>
            </Pressable>
            {editingId && (
              <Pressable style={styles.cancelButton} onPress={resetForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>In your pantry</Text>
          <Text style={styles.count}>{hydrated ? `${items.length} items` : 'Loading…'}</Text>
        </View>
        {items.length === 0 && hydrated ? (
          <Text style={styles.empty}>Nothing here yet. Add your first ingredient above.</Text>
        ) : (
          items.map((item) => (
            <View style={styles.itemRow} key={item.id}>
              <View style={styles.itemCopy}>
                <Text style={styles.ingredientName}>{item.name}</Text>
                <Text style={styles.muted}>
                  {[item.quantity, item.category].filter(Boolean).join(' · ') || 'No details'}
                </Text>
              </View>
              <Pressable onPress={() => editItem(item)} hitSlop={10}>
                <Text style={styles.edit}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  Alert.alert('Remove item?', `Remove ${item.name} from your pantry?`, [
                    { text: 'Keep' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.id) },
                  ])
                }
                hitSlop={10}>
                <Text style={styles.delete}>×</Text>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F3EA' },
  content: { padding: 22, paddingBottom: 48, gap: 16 },
  eyebrow: { color: '#B8613B', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: '#25332D', fontSize: 42, fontWeight: '800', letterSpacing: -1 },
  subtitle: { color: '#70685D', fontSize: 16, lineHeight: 23, marginTop: -8 },
  scanCard: { backgroundColor: '#25332D', borderRadius: 20, padding: 18, gap: 14 },
  scanCopy: { gap: 5 },
  scanTitle: { color: '#FFFDF9', fontSize: 18, fontWeight: '800' },
  cardTitle: { color: '#25332D', fontSize: 18, fontWeight: '800' },
  cardText: { color: '#D8DED6', fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#DDE9D5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
  secondaryButtonText: { color: '#25332D', fontWeight: '800', fontSize: 13 },
  status: { color: '#F4C6A8', fontSize: 13 },
  reviewCard: { backgroundColor: '#FFFDF9', borderRadius: 16, padding: 16, gap: 12 },
  detectedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  check: { backgroundColor: '#E7683D', color: '#FFF', width: 24, height: 24, textAlign: 'center', lineHeight: 24, borderRadius: 7, overflow: 'hidden', fontWeight: '800' },
  unchecked: { backgroundColor: '#E7DFD4' },
  ingredientName: { color: '#25332D', fontSize: 15, fontWeight: '700', flex: 1 },
  muted: { color: '#8C8275', fontSize: 13 },
  formCard: { backgroundColor: '#FFFDF9', borderRadius: 16, padding: 16, gap: 11 },
  input: { backgroundColor: '#F3EDE3', borderRadius: 11, padding: 13, color: '#25332D', fontSize: 15, flex: 1 },
  halfInput: { minWidth: 0 },
  primaryButton: { backgroundColor: '#E7683D', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  cancelButton: { paddingHorizontal: 10 },
  cancelText: { color: '#B8613B', fontWeight: '700' },
  listHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 },
  sectionTitle: { color: '#25332D', fontSize: 22, fontWeight: '800' },
  count: { color: '#8C8275', fontSize: 13 },
  empty: { color: '#8C8275', backgroundColor: '#FFFDF9', borderRadius: 14, padding: 18, lineHeight: 21 },
  itemRow: { backgroundColor: '#FFFDF9', borderRadius: 14, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 14 },
  itemCopy: { flex: 1, gap: 4 },
  edit: { color: '#4D7C65', fontWeight: '800', fontSize: 13 },
  delete: { color: '#B8613B', fontSize: 25, lineHeight: 20 },
});
