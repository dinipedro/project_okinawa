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
    <Card style={[styles.card, { backgroundColor: colors.card }]}>
      {item.image_url && (
        <Card.Cover source={{ uri: item.image_url }} style={styles.image} />
      )}
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={{ color: colors.foreground }}>{item.name}</Text>
            <Chip compact style={[styles.categoryChip, { backgroundColor: colors.muted }]}>
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
            />
            <Text variant="titleMedium" style={[styles.quantity, { color: colors.foreground }]}>
              {quantityInCart}
            </Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => onAddToCart(item)}
              mode="contained"
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

// Note: All styles use inline semantic tokens via useColors()

export default MenuItemCard;
