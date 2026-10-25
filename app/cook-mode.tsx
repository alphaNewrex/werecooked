import { Check, ChevronLeft, ChevronRight, Circle, ListChecks } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Screen } from '@/components/layout';
import { getCurrentRecipe } from '@/lib/recipe-store';
import { useTheme } from '@/lib/theme';

export default function CookModeScreen() {
  useKeepAwake();
  const router = useRouter();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const current = getCurrentRecipe();
  const recipe = current?.recipe;
  const [checked, setChecked] = useState<boolean[]>(() => recipe?.ingredients.map(() => false) ?? []);
  const [phase, setPhase] = useState<'ingredients' | 'steps'>('ingredients');
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    navigation.setOptions({ title: recipe?.title ?? 'Cook mode' });
  }, [navigation, recipe?.title]);

  if (!recipe) {
    return (
      <Screen scroll={false}>
        <View className="flex-1 items-center justify-center gap-3 p-8">
          <Text className="font-display text-2xl">No recipe selected</Text>
          <Button variant="ghost" onPress={() => router.back()}><Text>Go back</Text></Button>
        </View>
      </Screen>
    );
  }

  function toggleIngredient(index: number) {
    setChecked((currentChecked) =>
      currentChecked.map((value, checkedIndex) => (checkedIndex === index ? !value : value)),
    );
  }

  function nextStep() {
    if (stepIndex === (recipe?.steps.length ?? 1) - 1) {
      router.back();
      return;
    }
    setStepIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <Screen scroll={false}>
      <ScrollView className="flex-1" contentContainerClassName="gap-5 p-5 pb-12">
        {phase === 'ingredients' ? (
          <>
            <View className="gap-2">
              <Text className="font-mono-medium text-xs uppercase tracking-widest text-primary">Prep check</Text>
              <Text variant="display-xl">Gather your ingredients</Text>
              <Text variant="muted">Tap each item as it hits the counter.</Text>
            </View>
            <Card className="gap-2 rounded-2xl border-border bg-card p-3">
              {recipe.ingredients.map((ingredient, index) => (
                <Pressable
                  key={`${index}-${ingredient.name}`}
                  testID="cook-ingredient"
                  role="checkbox"
                  accessibilityState={{ checked: checked[index] }}
                  className={`flex-row items-center gap-3 rounded-xl border px-3 py-3 ${
                    checked[index] ? 'border-success-soft bg-success-soft' : 'border-border bg-background'
                  }`}
                  onPress={() => toggleIngredient(index)}>
                  {checked[index] ? <Check color={colors.success} size={18} /> : <Circle color={colors.textMuted} size={18} />}
                  <Text className={`flex-1 ${checked[index] ? 'text-muted-foreground line-through' : ''}`}>
                    {ingredient.amount} {ingredient.name}
                  </Text>
                </Pressable>
              ))}
            </Card>
            <Button onPress={() => setPhase('steps')}>
              <ListChecks color={colors.onPrimary} size={18} />
              <Text>Start steps</Text>
            </Button>
          </>
        ) : (
          <>
            <View className="flex-row items-center justify-between">
              <Text className="font-mono-medium text-xs uppercase tracking-widest text-primary">Cooking now</Text>
              <Text testID="cook-progress" className="font-mono text-xs text-muted-foreground">
                Step {stepIndex + 1} of {recipe.steps.length}
              </Text>
            </View>
            <Card className="min-h-80 justify-center rounded-xl border-0 bg-success-soft p-6 shadow-none">
              <Text testID="cook-step" variant="display-lg">
                {recipe.steps[stepIndex]}
              </Text>
            </Card>
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={stepIndex === 0}
                onPress={() => setStepIndex((currentIndex) => Math.max(0, currentIndex - 1))}>
                <ChevronLeft color={colors.text} size={18} />
                <Text>Back</Text>
              </Button>
              <Button className="flex-1" onPress={nextStep}>
                <Text>{stepIndex === recipe.steps.length - 1 ? 'Done' : 'Next'}</Text>
                {stepIndex < recipe.steps.length - 1 && <ChevronRight color={colors.onPrimary} size={18} />}
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
