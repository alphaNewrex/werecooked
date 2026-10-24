import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
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
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-4 p-5 pb-12"
        showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-extrabold tracking-widest text-primary">YOUR KITCHEN, IN ONE PLACE</Text>
        <Text className="text-4xl font-extrabold tracking-tight text-foreground">Pantry</Text>
        <Text className="-mt-2 text-base leading-6 text-muted-foreground">
          Tell CookFood what you have. We’ll handle the rest.
        </Text>

        <Card className="gap-4 rounded-2xl border-0 bg-foreground p-5">
          <View className="gap-1">
            <Text className="text-lg font-extrabold text-background">See what’s on hand</Text>
            <Text className="text-sm leading-5 text-background/80">
              Snap a shelf or choose a photo. You review every result.
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Button variant="secondary" size="sm" onPress={() => void pickAndScan('camera')}>
              <Text>Camera</Text>
            </Button>
            <Button variant="outline" size="sm" onPress={() => void pickAndScan('library')}>
              <Text>Photo library</Text>
            </Button>
          </View>
          {scanning && <Text className="text-sm text-primary-foreground">Reading your photo…</Text>}
        </Card>

        {detected.length > 0 && (
          <Card className="gap-3 rounded-2xl p-4">
            <Text className="text-lg font-extrabold">Review detected items</Text>
            {detected.map((item, index) => (
              <Button
                key={`${item.name}-${index}`}
                variant="ghost"
                className="h-auto justify-start px-0 py-1"
                onPress={() =>
                  setDetected((current) =>
                    current.map((entry, entryIndex) =>
                      entryIndex === index ? { ...entry, selected: !entry.selected } : entry,
                    ),
                  )
                }>
                <Text className={item.selected ? 'text-primary' : 'text-muted-foreground'}>
                  {item.selected ? '✓' : '○'}
                </Text>
                <Text className="flex-1 text-left font-semibold">{item.name}</Text>
                <Text variant="muted">{item.quantity ?? ''}</Text>
              </Button>
            ))}
            <Button onPress={addDetected}>
              <Text>Add selected to pantry</Text>
            </Button>
          </Card>
        )}

        <Card className="gap-3 rounded-2xl p-4">
          <Text className="text-lg font-extrabold">{editingId ? 'Edit ingredient' : 'Add an ingredient'}</Text>
          <Input
            placeholder="Ingredient name"
            value={name}
            onChangeText={setName}
            className="bg-muted"
          />
          <View className="flex-row gap-2">
            <Input
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              className="flex-1 bg-muted"
            />
            <Input
              placeholder="Category"
              value={category}
              onChangeText={setCategory}
              className="flex-1 bg-muted"
            />
          </View>
          <View className="flex-row items-center gap-2">
            <Button onPress={saveItem}>
              <Text>{editingId ? 'Save changes' : 'Add to pantry'}</Text>
            </Button>
            {editingId && (
              <Button variant="ghost" onPress={resetForm}>
                <Text>Cancel</Text>
              </Button>
            )}
          </View>
        </Card>

        <View className="mt-2 flex-row items-baseline justify-between">
          <Text className="text-2xl font-extrabold">In your pantry</Text>
          <Text variant="muted">{hydrated ? `${items.length} items` : 'Loading…'}</Text>
        </View>
        {items.length === 0 && hydrated ? (
          <Text className="rounded-xl bg-card p-5 leading-5 text-muted-foreground">
            Nothing here yet. Add your first ingredient above.
          </Text>
        ) : (
          items.map((item) => (
            <Card className="flex-row items-center gap-2 rounded-2xl p-4" key={item.id}>
              <View className="min-w-0 flex-1 gap-1">
                <Text className="font-bold">{item.name}</Text>
                <Text variant="muted">
                  {[item.quantity, item.category].filter(Boolean).join(' · ') || 'No details'}
                </Text>
              </View>
              {item.category && (
                <Badge variant="secondary">
                  <Text>{item.category}</Text>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onPress={() => editItem(item)}>
                <Text>Edit</Text>
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onPress={() =>
                  Alert.alert('Remove item?', `Remove ${item.name} from your pantry?`, [
                    { text: 'Keep' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeItem(item.id) },
                  ])
                }>
                <Text className="text-lg text-white">×</Text>
              </Button>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
