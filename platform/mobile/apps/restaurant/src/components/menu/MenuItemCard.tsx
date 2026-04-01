import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, Chip, Switch } from 'react-native-paper';
import type { MenuItem } from '../../types';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleAvailability?: (itemId: string, isAvailable: boolean) => void;
  showActions?: boolean;
}

export default function MenuItemCard({
  item,
  onPress,
  onEdit,
  onDelete,
  onToggleAvailability,
  showActions = true,
}: MenuItemCardProps) {
  const colors = useColors();

  const styles = useMemo(() => StyleSheet.create({
    card: {
      marginBottom: 16,
      elevation: 2,
      backgroundColor: colors.card,
    },
    unavailableCard: {
      opacity: 0.6,
    },
    cover: {
      height: 150,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: 12,
      marginBottom: 12,
    },
    headerLeft: {
      flex: 1,
      marginRight: 12,
    },
    name: {
      fontWeight: '600',
      color: colors.foreground,
    },
    description: {
      color: colors.foregroundMuted,
      marginTop: 4,
    },
    price: {
      fontWeight: 'bold',
      color: colors.success,
    },
    details: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    categoryChip: {
      height: 24,
      backgroundColor: '#E3F2FD',
    },
    categoryText: {
      color: '#1976D2',
      fontSize: 12,
    },
    allergenChip: {
      height: 24,
      backgroundColor: '#FFEBEE',
    },
    allergenText: {
      color: '#C62828',
      fontSize: 12,
    },
    vegChip: {
      height: 24,
      backgroundColor: '#E8F5E9',
    },
    vegText: {
      color: '#2E7D32',
      fontSize: 12,
    },
    veganChip: {
      height: 24,
      backgroundColor: '#F1F8E9',
    },
    veganText: {
      color: '#558B2F',
      fontSize: 12,
    },
    allergensList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 12,
      padding: 8,
      backgroundColor: colors.primaryLight,
      borderRadius: 8,
    },
    allergensLabel: {
      fontWeight: '600',
      color: colors.foregroundMuted,
      marginRight: 4,
    },
    allergensText: {
      color: colors.foregroundMuted,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    availability: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    availabilityLabel: {
      marginRight: 8,
      color: colors.foregroundMuted,
    },
    actionButtons: {
      flexDirection: 'row',
    },
    actionIcon: {
      margin: 0,
      padding: 0,
    },
  }), [colors]);

  const CardContent = () => (
    <>
      {item.image_url && <Card.Cover source={{ uri: item.image_url }} style={styles.cover} />}
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="titleMedium" style={styles.name}>
              {item.name}
            </Text>
            {item.description && (
              <Text variant="bodySmall" numberOfLines={2} style={styles.description}>
                {item.description}
              </Text>
            )}
          </View>
          <Text variant="titleLarge" style={styles.price}>
            R$ {item.price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.details}>
          {item.category && (
            <Chip style={styles.categoryChip} textStyle={styles.categoryText} icon="tag">
              {typeof item.category === 'string' ? item.category : item.category.name}
            </Chip>
          )}
          {item.allergens && item.allergens.length > 0 && (
            <Chip style={styles.allergenChip} textStyle={styles.allergenText} icon="alert-circle">
              Alérgenos
            </Chip>
          )}
          {(item as any).is_vegetarian && (
            <Chip style={styles.vegChip} textStyle={styles.vegText} icon="leaf">
              Vegetariano
            </Chip>
          )}
          {(item as any).is_vegan && (
            <Chip style={styles.veganChip} textStyle={styles.veganText} icon="sprout">
              Vegano
            </Chip>
          )}
        </View>

        {item.allergens && item.allergens.length > 0 && (
          <View style={styles.allergensList}>
            <Text variant="bodySmall" style={styles.allergensLabel}>
              Alérgenos:
            </Text>
            <Text variant="bodySmall" style={styles.allergensText}>
              {item.allergens.join(', ')}
            </Text>
          </View>
        )}

        {showActions && (
          <View style={styles.actions}>
            <View style={styles.availability}>
              <Text variant="bodySmall" style={styles.availabilityLabel}>
                Disponível
              </Text>
              <Switch
                value={item.is_available}
                onValueChange={(value) => onToggleAvailability && onToggleAvailability(item.id, value)}
                color={colors.success}
              />
            </View>
            <View style={styles.actionButtons}>
              {onEdit && (
                <IconButton icon="pencil" size={20} onPress={onEdit} style={styles.actionIcon} iconColor="#0091EA" />
              )}
              {onDelete && (
                <IconButton icon="delete" size={20} onPress={onDelete} style={styles.actionIcon} iconColor="#d32f2f" />
              )}
            </View>
          </View>
        )}
      </Card.Content>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card style={[styles.card, !item.is_available && styles.unavailableCard]}>{CardContent()}</Card>
      </TouchableOpacity>
    );
  }

  return <Card style={[styles.card, !item.is_available && styles.unavailableCard]}>{CardContent()}</Card>;
}
