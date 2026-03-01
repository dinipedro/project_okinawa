import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, Button, IconButton, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  address: string;
  rating: number;
  image_url?: string;
}

interface Favorite {
  id: string;
  restaurant_id: string;
  notes?: string;
  created_at: string;
  restaurant: Restaurant;
}

interface FavoriteCardProps {
  favorite: Favorite;
  onPress: (restaurantId: string) => void;
  onRemove: (restaurantId: string, restaurantName: string) => void;
  onViewMenu: (restaurantId: string) => void;
}

const FavoriteCard = memo<FavoriteCardProps>(({
  favorite,
  onPress,
  onRemove,
  onViewMenu,
}) => {
  const colors = useColors();

  return (
    <Card
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => onPress(favorite.restaurant.id)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.restaurantInfo}>
            <Text variant="titleLarge" style={[styles.restaurantName, { color: colors.foreground }]}>
              {favorite.restaurant.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color={colors.warning} />
              <Text variant="bodyMedium" style={[styles.rating, { color: colors.foregroundSecondary }]}>
                {favorite.restaurant.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <IconButton
            icon="heart"
            iconColor={colors.error}
            size={24}
            onPress={() => onRemove(favorite.restaurant.id, favorite.restaurant.name)}
          />
        </View>

        <Chip icon="silverware-fork-knife" style={[styles.chip, { backgroundColor: colors.muted }]}>
          {favorite.restaurant.cuisine_type}
        </Chip>

        <View style={styles.addressContainer}>
          <Icon name="map-marker" size={16} color={colors.foregroundSecondary} />
          <Text variant="bodySmall" style={[styles.address, { color: colors.foregroundSecondary }]}>
            {favorite.restaurant.address}
          </Text>
        </View>

        {favorite.notes && (
          <View style={[styles.notesContainer, { backgroundColor: colors.warningBackground }]}>
            <Icon name="note-text" size={16} color={colors.foregroundSecondary} />
            <Text variant="bodySmall" style={[styles.notes, { color: colors.foregroundSecondary }]}>
              {favorite.notes}
            </Text>
          </View>
        )}
      </Card.Content>

      <Card.Actions>
        <Button onPress={() => onPress(favorite.restaurant.id)}>
          Ver Detalhes
        </Button>
        <Button onPress={() => onViewMenu(favorite.restaurant.id)}>
          Ver Cardápio
        </Button>
      </Card.Actions>
    </Card>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.favorite.id === nextProps.favorite.id &&
    prevProps.favorite.notes === nextProps.favorite.notes &&
    prevProps.favorite.restaurant.rating === nextProps.favorite.restaurant.rating
  );
});

FavoriteCard.displayName = 'FavoriteCard';

// Note: Styles are inline using semantic tokens via useColors()

export default FavoriteCard;
