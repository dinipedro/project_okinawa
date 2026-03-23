import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { typography } from '@okinawa/shared/theme/typography';
import { spacing } from '@okinawa/shared/theme/spacing';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

interface Pairing {
  id: string;
  item: MenuItem;
  reason: string;
  matchScore: number;
  type: 'beverage' | 'side' | 'dessert';
}

interface AIPairingAssistantScreenProps {
  navigation: any;
  route: {
    params: {
      selectedItems: MenuItem[];
    };
  };
}

export const AIPairingAssistantScreen: React.FC<AIPairingAssistantScreenProps> = ({
  navigation,
  route,
}) => {
  const colors = useColors();
  const { selectedItems } = route.params;

  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPairings, setSelectedPairings] = useState<string[]>([]);

  useEffect(() => {
    generatePairings();
  }, []);

  const generatePairings = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockPairings: Pairing[] = [
      {
        id: '1',
        item: {
          id: 'w1',
          name: 'Vinho Tinto Reserva',
          description: 'Cabernet Sauvignon chileno, notas de frutas vermelhas',
          price: 89.90,
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200',
          category: 'Vinhos',
        },
        reason: 'Harmoniza perfeitamente com carnes vermelhas, realçando os sabores.',
        matchScore: 95,
        type: 'beverage',
      },
      {
        id: '2',
        item: {
          id: 'b1',
          name: 'Cerveja Artesanal IPA',
          description: 'IPA com notas cítricas e amargor equilibrado',
          price: 24.90,
          image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=200',
          category: 'Cervejas',
        },
        reason: 'O amargor complementa pratos condimentados e gordurosos.',
        matchScore: 88,
        type: 'beverage',
      },
      {
        id: '3',
        item: {
          id: 's1',
          name: 'Batatas Rústicas',
          description: 'Batatas assadas com ervas finas e alho',
          price: 18.90,
          image: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=200',
          category: 'Acompanhamentos',
        },
        reason: 'Acompanhamento clássico que equilibra texturas do prato principal.',
        matchScore: 92,
        type: 'side',
      },
      {
        id: '4',
        item: {
          id: 'd1',
          name: 'Petit Gâteau',
          description: 'Bolo de chocolate com centro cremoso e sorvete',
          price: 32.90,
          image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=200',
          category: 'Sobremesas',
        },
        reason: 'Finalização perfeita após refeição salgada, contraste de temperaturas.',
        matchScore: 90,
        type: 'dessert',
      },
    ];

    setPairings(mockPairings);
    setLoading(false);
  };

  const togglePairing = (id: string) => {
    setSelectedPairings(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const addSelectedToOrder = () => {
    const itemsToAdd = pairings
      .filter(p => selectedPairings.includes(p.id))
      .map(p => p.item);
    navigation.navigate('SharedOrder', { addItems: itemsToAdd });
  };

  const getTypeLabel = (type: Pairing['type']) => {
    switch (type) {
      case 'beverage': return 'Bebida';
      case 'side': return 'Acompanhamento';
      case 'dessert': return 'Sobremesa';
    }
  };

  const getTypeIcon = (type: Pairing['type']) => {
    switch (type) {
      case 'beverage': return 'wine';
      case 'side': return 'restaurant';
      case 'dessert': return 'ice-cream';
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>
          Assistente de Harmonização
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.selectedSummary}>
        <Text style={styles.summaryLabel}>
          Baseado nos seus itens:
        </Text>
        <Text style={styles.summaryItems}>
          {selectedItems.map(i => i.name).join(', ')}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            Analisando combinações perfeitas...
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>
            Sugestões da IA
          </Text>

          {pairings.map(pairing => (
            <TouchableOpacity
              key={pairing.id}
              style={[
                styles.pairingCard,
                selectedPairings.includes(pairing.id) && styles.pairingCardSelected,
              ]}
              onPress={() => togglePairing(pairing.id)}
              accessibilityRole="button"
              accessibilityLabel={`${pairing.item.name}: ${getTypeLabel(pairing.type)}, ${pairing.matchScore}% match, R$ ${pairing.item.price.toFixed(2)}`}
              accessibilityState={{ selected: selectedPairings.includes(pairing.id) }}
            >
              <Image
                source={{ uri: pairing.item.image }}
                style={styles.itemImage}
                accessibilityLabel={pairing.item.name}
              />
              
              <View style={styles.pairingContent}>
                <View style={styles.pairingHeader}>
                  <View style={styles.typeTag}>
                    <Ionicons
                      name={getTypeIcon(pairing.type) as any}
                      size={12}
                      color={colors.primary}
                    />
                    <Text style={styles.typeText}>
                      {getTypeLabel(pairing.type)}
                    </Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{pairing.matchScore}%</Text>
                  </View>
                </View>

                <Text style={styles.itemName}>
                  {pairing.item.name}
                </Text>
                <Text style={styles.itemDescription}>
                  {pairing.item.description}
                </Text>
                
                <View style={styles.reasonBox}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={styles.reasonText}>
                    {pairing.reason}
                  </Text>
                </View>

                <Text style={styles.price}>
                  R$ {pairing.item.price.toFixed(2)}
                </Text>
              </View>

              <View style={styles.checkbox}>
                <Ionicons
                  name={selectedPairings.includes(pairing.id) ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={selectedPairings.includes(pairing.id) ? colors.primary : colors.foregroundMuted}
                />
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {selectedPairings.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addSelectedToOrder}
            accessibilityRole="button"
            accessibilityLabel={`Add ${selectedPairings.length} item${selectedPairings.length !== 1 ? 's' : ''} to order`}
          >
            <Text style={styles.addButtonText}>
              Adicionar {selectedPairings.length} item(s) ao pedido
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold as any,
    color: colors.foreground,
  },
  selectedSummary: {
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.xs,
    color: colors.foregroundMuted,
  },
  summaryItems: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium as any,
    color: colors.foreground,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.sizes.md,
    color: colors.foregroundMuted,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    marginBottom: spacing.md,
    color: colors.foreground,
  },
  pairingCard: {
    flexDirection: 'row',
    borderRadius: spacing.lg,
    borderWidth: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  pairingCardSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  itemImage: {
    width: 100,
    height: '100%',
    minHeight: 150,
  },
  pairingContent: {
    flex: 1,
    padding: spacing.md,
  },
  pairingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.sm,
    backgroundColor: `${colors.primary}20`,
  },
  typeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium as any,
    color: colors.primary,
  },
  matchBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.sm,
  },
  matchText: {
    color: colors.successForeground || '#fff',
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as any,
  },
  itemName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
    marginBottom: 2,
    color: colors.foreground,
  },
  itemDescription: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.sm,
    color: colors.foregroundMuted,
  },
  reasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.muted,
  },
  reasonText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    color: colors.foreground,
  },
  price: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
  },
  checkbox: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  addButton: {
    paddingVertical: spacing.md,
    borderRadius: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: colors.primaryForeground,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as any,
  },
});

export default AIPairingAssistantScreen;
