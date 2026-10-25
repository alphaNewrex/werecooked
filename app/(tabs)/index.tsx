import * as ImagePicker from 'expo-image-picker';
import { Camera, Check, Images, Pencil, Plus, ScanLine, Trash2, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { useFeedback } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Notice } from '@/components/ui/notice';
import { Text } from '@/components/ui/text';
import { postJson } from '@/lib/api';
import { usePantry } from '@/lib/pantry';
import { useTheme } from '@/lib/theme';

type DetectedItem = {
  name: string;
  quantity?: string;
  category?: string;
  selected: boolean;
};

export default function PantryScreen() {
  const { items, hydrated, addItem, addMany, updateItem, removeItem } = usePantry();
  const { confirm: confirmFeedback, toast } = useFeedback();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(true);
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [scanning, setScanning] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const groups = useMemo(() => {
    const grouped = new Map<string, typeof items>();
    for (const item of items) {
      const key = item.category?.trim().toLowerCase() || 'other';
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  function resetForm() {
    setName('');
    setQuantity('');
    setCategory('');
    setEditingId(null);
  }

  function saveItem() {
    if (!name.trim()) {
      setFormError('Give your pantry item a name first.');
      toast({ message: 'Add an ingredient: Give your pantry item a name first.', tone: 'warning' });
      return;
    }
    setFormError(null);
    const input = {
      name: name.trim(),
      quantity: quantity.trim() || undefined,
      category: category.trim() || undefined,
    };
    if (editingId) updateItem(editingId, input);
    else addItem(input);
    resetForm();
    setFormOpen(false);
  }

  function editItem(item: (typeof items)[number]) {
    setEditingId(item.id);
    setName(item.name);
    setQuantity(item.quantity ?? '');
    setCategory(item.category ?? '');
    setFormOpen(true);
  }

  async function pickAndScan(source: 'camera' | 'library') {
    setScanError(null);
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setScanError('Allow camera access to scan your pantry.');
          toast({ message: 'Camera permission needed: Allow camera access to scan your pantry.', tone: 'warning' });
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
      if (!asset?.base64) return;
      setScanning(true);
      const response = await postJson<{
        items: { name: string; quantity?: string; category?: string }[];
      }>('/api/scan-pantry', {
        imageBase64: asset.base64,
        mimeType: asset.mimeType ?? 'image/jpeg',
      });
      setDetected(response.items.map((item) => ({ ...item, selected: true })));
      if (response.items.length === 0) {
        setScanError('We couldn’t spot any food in that photo. Try a clearer shot.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Try another photo.';
      setScanError(message);
      toast({ message: `Scan failed: ${message}`, tone: 'danger' });
    } finally {
      setScanning(false);
    }
  }

  async function confirmRemove(item: (typeof items)[number]) {
    if (await confirmFeedback({ title: 'Remove item?', message: `Remove ${item.name} from your pantry?`, confirmLabel: 'Remove', destructive: true })) {
      removeItem(item.id);
    }
  }

  function addDetected() {
    addMany(detected.filter((item) => item.selected).map(({ selected: _selected, ...item }) => item));
    setDetected([]);
  }

  const dock = (
    <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
      <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full border border-border bg-card" accessibilityLabel="Add item" onPress={() => { setEditingId(null); setFormOpen(true); }}>
        <Plus color={colors.text} size={21} />
      </Button>
      <View className="items-center gap-1">
        <Button size="icon" className="h-20 w-20 rounded-full border-8 border-primary-soft bg-primary" accessibilityLabel="Scan your shelf" disabled={scanning} onPress={() => void pickAndScan('camera')}>
          {scanning ? <ScanLine color={colors.onPrimary} size={30} strokeWidth={2.2} /> : <Camera color={colors.onPrimary} size={30} strokeWidth={2.2} />}
        </Button>
        <Text variant="label" tone="muted">{scanning ? 'Reading your photo…' : 'Scan shelf'}</Text>
      </View>
      <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full border border-border bg-card" accessibilityLabel="Upload a photo" disabled={scanning} onPress={() => void pickAndScan('library')}>
        <Images color={colors.text} size={21} />
      </Button>
    </View>
  );

  return (
    <Screen scroll={false} footer={dock}>
      <ScrollView style={{ flex: 1 }} contentContainerClassName="gap-5 p-5 pb-40" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-end justify-between">
          <Text variant="display-xl">Pantry</Text>
          <Text testID="pantry-count" className="font-mono-medium text-sm text-muted-foreground">
            {hydrated ? `${items.length} ${items.length === 1 ? 'item' : 'items'}` : 'Loading…'}
          </Text>
        </View>

        {formOpen && (
          <Card className="gap-3 rounded-2xl border-border bg-card p-4">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans-bold text-lg">{editingId ? 'Edit ingredient' : 'Add an ingredient'}</Text>
              {items.length > 0 && !editingId && (
                <Button variant="ghost" size="icon" className="h-8 w-8" accessibilityLabel="Close add item form" onPress={() => setFormOpen(false)}>
                  <X color={colors.textMuted} size={18} />
                </Button>
              )}
            </View>
            <Input placeholder="Ingredient name" value={name} onChangeText={setName} />
            <View className="flex-row gap-2">
              <Input placeholder="Quantity" value={quantity} onChangeText={setQuantity} className="flex-1" mono />
              <Input placeholder="Category" value={category} onChangeText={setCategory} className="flex-1" />
            </View>
            {formError && <Notice tone="danger" title="Add an ingredient" body={formError} />}
            <Button onPress={saveItem}><Text>{editingId ? 'Save changes' : 'Add to pantry'}</Text></Button>
          </Card>
        )}

        {detected.length > 0 && (
          <Card className="gap-4 rounded-xl border-border bg-card p-5">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-display text-2xl">Found {detected.length} items</Text>
                <Text variant="muted">Tap an item to leave it out.</Text>
              </View>
              <Button variant="ghost" size="sm" onPress={() => setDetected([])}><Text>Discard</Text></Button>
            </View>
            <View className="gap-2">
              {detected.map((item, index) => (
                <Pressable
                  key={`${item.name}-${index}`}
                  className={`flex-row items-center gap-2 rounded-full border px-4 py-3 ${item.selected ? 'border-success-soft bg-success-soft' : 'border-border bg-card'}`}
                  onPress={() => setDetected((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, selected: !entry.selected } : entry))}>
                  {item.selected ? <Check color={colors.success} size={17} /> : <Plus color={colors.textMuted} size={17} />}
                  <Text className="flex-1 font-sans-medium">{item.name}</Text>
                  <Text className="font-mono text-xs text-muted-foreground">{item.quantity ?? ''}</Text>
                </Pressable>
              ))}
            </View>
            <Button onPress={addDetected}><Text>Add selected to pantry</Text></Button>
          </Card>
        )}
        {scanError && <Notice tone="danger" title="Scan failed" body={scanError} />}

        {items.length === 0 && hydrated ? (
          <Card className="gap-2 rounded-2xl border-dashed border-border bg-transparent p-5 shadow-none">
            <Text className="font-sans-bold text-lg">Your pantry is empty.</Text>
            <Text variant="muted">Scan a shelf or add your first ingredient.</Text>
          </Card>
        ) : (
          groups.map(([categoryName, group]) => (
            <View className="gap-2" key={categoryName}>
              <Text className="font-mono-medium text-xs uppercase tracking-widest text-muted-foreground">{categoryName}</Text>
              <View className="flex-row flex-wrap gap-2">
                {group.map((item) => {
                  const expanded = expandedId === item.id;
                  return (
                    <View className={`${expanded ? 'w-full' : ''} gap-2`} key={item.id}>
                      <Pressable
                        className={`flex-row items-center gap-2 self-start rounded-full border bg-card px-4 py-3 ${expanded ? 'border-primary' : 'border-border'}`}
                        onPress={() => setExpandedId(expanded ? null : item.id)}>
                        <Text className="font-sans-medium">{item.name}</Text>
                        {item.quantity && <Text className="font-mono text-xs text-muted-foreground">{item.quantity}</Text>}
                      </Pressable>
                      {expanded && (
                        <Card className="gap-3 rounded-2xl border-border bg-card p-4">
                          <View className="flex-row items-center justify-between">
                            <Text className="font-sans-bold">{item.name}</Text>
                            <Badge variant="secondary"><Text className="font-mono text-xs">{categoryName}</Text></Badge>
                          </View>
                          <Text variant="muted" className="font-mono text-xs">Quantity · {item.quantity || 'not specified'}</Text>
                          {item.macros && (
                            <View className="rounded-lg bg-warning-soft px-3 py-2">
                              <Text className="font-mono text-xs text-foreground">
                                {item.macros.kcal.toFixed(0)} kcal · P {item.macros.proteinG.toFixed(1)}g · C {item.macros.carbsG.toFixed(1)}g · F {item.macros.fatG.toFixed(1)}g / 100g
                              </Text>
                            </View>
                          )}
                          <View className="flex-row gap-2">
                            <Button variant="outline" size="sm" onPress={() => editItem(item)}><Pencil color={colors.text} size={15} /><Text>Edit</Text></Button>
                            <Button variant="ghost" size="sm" accessibilityLabel={`Remove ${item.name}`} onPress={() => confirmRemove(item)}><Trash2 color={colors.primary} size={15} /><Text className="text-primary">Remove</Text></Button>
                          </View>
                        </Card>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>

    </Screen>
  );
}
