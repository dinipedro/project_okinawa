import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, Chip, IconButton } from 'react-native-paper';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
  allergens?: string[];
  dietary_info?: string[];
}

interface MenuItemCardProps {
  item: MenuItem;
  quantityInCart: number;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
}

const MenuItemCard = memo<MenuItemCardProps>(({
  item,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
}) => {
  const { t } = useI18n();
  const colors = useColors();

  return (
    <Card
      style={[styles.card, { backgroundColor: colors.card }]}
      accessible={true}
      accessibilityLabel={`${item.name}, ${item.price.toFixed(2)} dollars, ${item.is_available ? 'available' : 'unavailable'}`}
    >
      {item.image_url && (
        <Card.Cover
          source={{ uri: item.image_url }}
          style={styles.image}
          accessibilityLabel={`Photo of ${item.name}`}
        />
      )}
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={{ color: colors.foreground }}>{item.name}</Text>
            <Chip compact style={[styles.categoryChip, { backgroundColor: colors.backgroundTertiary }]}>
              {item.category}
            </Chip>
          </View>
          <Text variant="titleLarge" style={[styles.price, { color: colors.primary }]}>
            ${item.price.toFixed(2)}
          </Text>
        </View>

        <Text variant="bodyMedium" style={[styles.description, { color: colors.foregroundSecondary }]}>
          {item.description}
        </Text>

        <View style={styles.details}>
          <Text variant="bodySmall" style={[styles.detailText, { color: colors.foregroundSecondary }]}>
            {t('menu.readyIn', { time: item.preparation_time })}
          </Text>
          {item.dietary_info && item.dietary_info.length > 0 && (
            <View style={styles.dietaryInfo}>
              {item.dietary_info.map((info, index) => (
                <Chip key={index} compact style={styles.dietaryChip}>
                  {info}
                </Chip>
              ))}
            </View>
          )}
        </View>

        {item.allergens && item.allergens.length > 0 && (
          <Text variant="bodySmall" style={[styles.allergens, { color: colors.error }]}>
            {t('menu.allergens')}: {item.allergens.join(', ')}
          </Text>
        )}
      </Card.Content>

      <Card.Actions style={styles.actions}>
        {quantityInCart === 0 ? (
          <Button
            mode="contained"
            onPress={() => onAddToCart(item)}
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            accessibilityLabel={`Add ${item.name} to cart`}
            accessibilityRole="button"
          >
            {t('menu.addToCart')}
          </Button>
        ) : (
          <View style={styles.quantityControl}>
            <IconButton
              icon="minus"
              size={20}
              onPress={() => onRemoveFromCart(item.id)}
              mode="contained"
              accessibilityLabel={`Decrease quantity of ${item.name}`}
              accessibilityRole="button"
            />
            <Text variant="titleMedium" style={[styles.quantity, { color: colors.foreground }]}>
              {quantityInCart}
            </Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => onAddToCart(item)}
              mode="contained"
              accessibilityLabel={`Increase quantity of ${item.name}`}
              accessibilityRole="button"
            />
          </View>
        )}
      </Card.Actions>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.quantityInCart === nextProps.quantityInCart
  );
});

MenuItemCard.displayName = 'MenuItemCard';

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  image: {
    height: 160,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  price: {
    fontWeight: '700',
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  },
  details: {
    marginBottom: 8,
  },
  detailText: {
    marginBottom: 4,
  },
  dietaryInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  dietaryChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  allergens: {
    marginTop: 4,
  },
  actions: {
    justifyContent: 'flex-end',
  },
  addButton: {
    borderRadius: 8,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quantity: {
    minWidth: 24,
    textAlign: 'center',
  },
});

export default MenuItemCard;
