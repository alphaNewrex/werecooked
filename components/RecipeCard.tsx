import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Recipe } from '@/lib/types';

export function RecipeCard({
  recipe,
  onPress,
}: {
  recipe: Recipe;
  onPress: () => void;
}) {
  const haveCount = recipe.ingredients.filter((ingredient) => ingredient.haveIt).length;
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topline}>
        <Text style={styles.match}>{haveCount}/{recipe.ingredients.length} on hand</Text>
        <Text style={styles.time}>{recipe.timeMinutes} min</Text>
      </View>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {recipe.description}
      </Text>
      <Text style={styles.link}>View recipe →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFDF9', borderRadius: 17, padding: 17, gap: 8 },
  topline: { flexDirection: 'row', justifyContent: 'space-between' },
  match: { color: '#4D7C65', fontWeight: '800', fontSize: 12 },
  time: { color: '#8C8275', fontSize: 12 },
  title: { color: '#25332D', fontSize: 22, fontWeight: '800' },
  description: { color: '#70685D', fontSize: 14, lineHeight: 20 },
  link: { color: '#B8613B', fontWeight: '800', fontSize: 13, marginTop: 3 },
});
