import { Children, ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

type ResponsiveCardGridProps = {
  children: ReactNode;
};

export function ResponsiveCardGrid({ children }: ResponsiveCardGridProps) {
  const { width } = useWindowDimensions();
  const columns = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
  const itemWidth = width / columns - 12;

  return (
    <View style={styles.grid}>
      {Children.map(children, (child, index) => (
        <View key={index} style={[styles.item, { width: itemWidth }]}>
          <View style={styles.inner}>{child}</View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  item: {
    padding: 6,
  },
  inner: {
    flex: 1,
  },
});
