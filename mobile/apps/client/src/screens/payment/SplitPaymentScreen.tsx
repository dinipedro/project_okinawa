import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  ActivityIndicator,
  Divider,
  Avatar,
  Chip,
  RadioButton,
  Checkbox,
  TextInput,
  Portal,
  Modal,
  SegmentedButtons,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ApiService from '@/shared/services/api';
import { useI18n } from '@/shared/hooks/useI18n';
import { useWebSocket } from '@/shared/hooks/useWebSocket';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SplitMode = 'individual' | 'equal' | 'selective' | 'fixed';

interface OrderItem {
  id: string;
  menu_item: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  unit_price: number;
  total_price: number;
  ordered_by: string;
  ordered_by_name?: string;
}

interface OrderGuest {
  id: string;
  guest_user_id?: string;
  guest_name: string;
  status: string;
  payment_status: string;
  amount_due: number;
  amount_paid: number;
  is_primary: boolean;
}

interface PaymentSplit {
  id: string;
  guest_user_id: string;
  guest_name: string;
  split_mode: string;
  amount_due: number;
  amount_paid: number;
  status: string;
  selected_items?: string[];
}

interface Order {
  id: string;
  restaurant_id: string;
  status: string;
  subtotal_amount: number;
  tax_amount: number;
  tip_amount: number;
  total_amount: number;
  items: OrderItem[];
}

export default function SplitPaymentScreen() {
  useScreenTracking('Split Payment');
  const analytics = useAnalytics();
  const colors = useColors();
  
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { t } = useI18n();
  const { orderId } = route.params as { orderId: string };

  const { connected, on, off, joinRoom, leaveRoom } = useWebSocket('/payments');

  const [order, setOrder] = useState<Order | null>(null);
  const [guests, setGuests] = useState<OrderGuest[]>([]);
  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Split mode state
  const [splitMode, setSplitMode] = useState<SplitMode>('individual');
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
  const [fixedAmounts, setFixedAmounts] = useState<Record<string, string>>({});
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<OrderGuest | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

  useEffect(() => {
    loadData();
  }, [orderId]);

  useEffect(() => {
    if (connected && orderId) {
      joinRoom(`payment:${orderId}`);

      const handlePaymentUpdate = (data: any) => {
        if (data.splits) {
          setSplits(data.splits);
        }
      };

      on('payment:split_updated', handlePaymentUpdate);
      on('payment:completed', handlePaymentUpdate);

      return () => {
        off('payment:split_updated', handlePaymentUpdate);
        off('payment:completed', handlePaymentUpdate);
        leaveRoom(`payment:${orderId}`);
      };
    }
  }, [connected, orderId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orderData, guestsData, splitsData] = await Promise.all([
        ApiService.getOrder(orderId),
        ApiService.getOrderGuests(orderId),
        ApiService.getOrderPaymentSplits(orderId).catch(() => []),
      ]);
      setOrder(orderData);
      setGuests(guestsData);
      setSplits(splitsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const calculateSplitAmounts = () => {
    if (!order || guests.length === 0) return {};

    const amounts: Record<string, number> = {};
    const totalAmount = order.total_amount;
    const guestCount = guests.length;

    switch (splitMode) {
      case 'individual':
        guests.forEach((guest) => {
          const guestItems = order.items.filter(
            (item) => item.ordered_by === guest.guest_user_id
          );
          amounts[guest.id] = guestItems.reduce(
            (sum, item) => sum + item.total_price,
            0
          );
        });
        const subtotal = order.subtotal_amount;
        const taxTipRatio = (order.tax_amount + order.tip_amount) / subtotal;
        Object.keys(amounts).forEach((guestId) => {
          amounts[guestId] = amounts[guestId] * (1 + taxTipRatio);
        });
        break;

      case 'equal':
        const equalAmount = totalAmount / guestCount;
        guests.forEach((guest) => {
          amounts[guest.id] = equalAmount;
        });
        break;

      case 'selective':
        guests.forEach((guest) => {
          const guestSelectedItems = selectedItems[guest.id] || [];
          const itemsTotal = order.items
            .filter((item) => guestSelectedItems.includes(item.id))
            .reduce((sum, item) => sum + item.total_price, 0);
          amounts[guest.id] = itemsTotal;
        });
        const selectedTotal = Object.values(amounts).reduce((a, b) => a + b, 0);
        const primaryGuest = guests.find((g) => g.is_primary);
        if (primaryGuest && selectedTotal < totalAmount) {
          amounts[primaryGuest.id] =
            (amounts[primaryGuest.id] || 0) + (totalAmount - selectedTotal);
        }
        break;

      case 'fixed':
        let fixedTotal = 0;
        guests.forEach((guest) => {
          const amount = parseFloat(fixedAmounts[guest.id] || '0');
          amounts[guest.id] = amount;
          fixedTotal += amount;
        });
        const primary = guests.find((g) => g.is_primary);
        if (primary && fixedTotal < totalAmount) {
          amounts[primary.id] =
            (amounts[primary.id] || 0) + (totalAmount - fixedTotal);
        }
        break;
    }

    return amounts;
  };

  const handleToggleItem = (guestId: string, itemId: string) => {
    setSelectedItems((prev) => {
      const guestItems = prev[guestId] || [];
      if (guestItems.includes(itemId)) {
        return {
          ...prev,
          [guestId]: guestItems.filter((id) => id !== itemId),
        };
      } else {
        return {
          ...prev,
          [guestId]: [...guestItems, itemId],
        };
      }
    });
  };

  const handleFixedAmountChange = (guestId: string, value: string) => {
    const numValue = value.replace(/[^0-9.]/g, '');
    setFixedAmounts((prev) => ({
      ...prev,
      [guestId]: numValue,
    }));
  };

  const handleCreateSplits = async () => {
    if (!order) return;

    setProcessing(true);
    try {
      const apiSplitMode = splitMode === 'fixed' ? 'split_selective' : 
                          splitMode === 'selective' ? 'split_selective' :
                          splitMode === 'equal' ? 'split_equal' : 'individual';
      
      await ApiService.createAllPaymentSplits(orderId, apiSplitMode);
      await loadData();
      
      await analytics.logEvent('payment_splits_created', {
        order_id: orderId,
        split_mode: splitMode,
        guest_count: guests.length,
      });

      Alert.alert(t('common.success'), t('payment.splitsCreated'));
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('errors.generic')
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleOpenPayment = (guest: OrderGuest) => {
    setSelectedGuest(guest);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedGuest || !order) return;

    const amounts = calculateSplitAmounts();
    const amount = amounts[selectedGuest.id] || 0;

    if (amount <= 0) {
      Alert.alert(t('common.error'), t('payment.invalidAmount'));
      return;
    }

    setProcessing(true);
    try {
      const split = splits.find((s) => s.guest_user_id === selectedGuest.guest_user_id);
      
      if (!split) {
        Alert.alert(t('common.error'), t('payment.splitNotFound'));
        return;
      }

      await ApiService.processSplitPayment({
        split_id: split.id,
        amount,
        payment_method: paymentMethod,
      });

      await analytics.logPurchase(orderId, amount, 'BRL');

      setShowPaymentModal(false);
      setSelectedGuest(null);
      await loadData();

      Alert.alert(t('common.success'), t('payment.paymentProcessed'));
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('errors.generic')
      );
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'partial':
        return colors.warning;
      case 'pending':
        return colors.foregroundMuted;
      default:
        return colors.foregroundMuted;
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundSecondary,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
    },
    loadingText: {
      marginTop: 16,
      color: colors.foregroundSecondary,
    },
    totalCard: {
      marginBottom: 16,
      backgroundColor: colors.primary,
    },
    totalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    totalLabel: {
      color: 'rgba(255,255,255,0.8)',
    },
    totalAmount: {
      color: 'white',
      fontWeight: 'bold',
    },
    paidInfo: {
      alignItems: 'flex-end',
    },
    paidLabel: {
      color: 'rgba(255,255,255,0.8)',
    },
    paidAmount: {
      color: 'white',
    },
    allPaidChip: {
      marginTop: 12,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignSelf: 'flex-start',
    },
    allPaidText: {
      color: 'white',
    },
    card: {
      marginBottom: 16,
      backgroundColor: colors.card,
    },
    sectionTitle: {
      marginBottom: 12,
      color: colors.foreground,
    },
    segmentedButtons: {
      marginBottom: 12,
    },
    modeDescription: {
      color: colors.foregroundSecondary,
      fontStyle: 'italic',
    },
    guestCard: {
      marginBottom: 12,
      backgroundColor: colors.card,
    },
    guestHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    guestInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    guestAvatar: {
      backgroundColor: colors.backgroundTertiary,
    },
    primaryAvatar: {
      backgroundColor: colors.primary,
    },
    guestDetails: {
      marginLeft: 12,
      flex: 1,
    },
    primaryBadge: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    statusChip: {
      marginTop: 4,
      height: 20,
      alignSelf: 'flex-start',
    },
    guestAmount: {
      alignItems: 'flex-end',
    },
    amountText: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    itemSelection: {
      marginTop: 8,
    },
    divider: {
      marginVertical: 12,
      backgroundColor: colors.border,
    },
    selectItemsLabel: {
      marginBottom: 8,
      color: colors.foregroundSecondary,
    },
    selectableItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
    },
    itemInfo: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginLeft: 8,
    },
    itemPrice: {
      color: colors.foregroundSecondary,
    },
    fixedAmountContainer: {
      marginTop: 8,
    },
    amountInput: {
      marginBottom: 8,
      backgroundColor: colors.card,
    },
    payButton: {
      marginTop: 12,
      backgroundColor: colors.success,
    },
    createSplitsButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
    },
    modalContent: {
      backgroundColor: colors.card,
      padding: 20,
      margin: 20,
      borderRadius: 8,
    },
    modalTitle: {
      marginBottom: 16,
      color: colors.foreground,
    },
    paymentSummary: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: 8,
    },
    paymentAmount: {
      marginTop: 4,
      color: colors.primary,
      fontWeight: 'bold',
    },
    radioItem: {
      paddingVertical: 4,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 16,
      gap: 8,
    },
    guestName: {
      color: colors.foreground,
    },
    itemText: {
      color: colors.foreground,
    },
    paymentSummaryText: {
      color: colors.foreground,
    },
  }), [colors]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.foreground }}>{t('orders.notFound')}</Text>
      </View>
    );
  }

  const amounts = calculateSplitAmounts();
  const totalPaid = guests.reduce((sum, g) => sum + g.amount_paid, 0);
  const allPaid = totalPaid >= order.total_amount;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Total Card */}
        <Card style={styles.totalCard}>
          <Card.Content>
            <View style={styles.totalHeader}>
              <View>
                <Text variant="bodyMedium" style={styles.totalLabel}>
                  {t('payment.totalToPay')}
                </Text>
                <Text variant="headlineLarge" style={styles.totalAmount}>
                  R$ {order.total_amount.toFixed(2)}
                </Text>
              </View>
              <View style={styles.paidInfo}>
                <Text variant="bodyMedium" style={styles.paidLabel}>
                  {t('payment.paid')}
                </Text>
                <Text variant="titleLarge" style={styles.paidAmount}>
                  R$ {totalPaid.toFixed(2)}
                </Text>
              </View>
            </View>
            {allPaid && (
              <Chip
                mode="flat"
                icon="check-circle"
                style={styles.allPaidChip}
                textStyle={styles.allPaidText}
              >
                {t('payment.allPaid')}
              </Chip>
            )}
          </Card.Content>
        </Card>

        {/* Split Mode Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {t('payment.splitMode')}
            </Text>
            
            <SegmentedButtons
              value={splitMode}
              onValueChange={(value) => setSplitMode(value as SplitMode)}
              buttons={[
                { value: 'individual', label: t('payment.individual') },
                { value: 'equal', label: t('payment.equal') },
                { value: 'selective', label: t('payment.selective') },
                { value: 'fixed', label: t('payment.fixed') },
              ]}
              style={styles.segmentedButtons}
            />

            <Text variant="bodySmall" style={styles.modeDescription}>
              {splitMode === 'individual' && t('payment.individualDesc')}
              {splitMode === 'equal' && t('payment.equalDesc')}
              {splitMode === 'selective' && t('payment.selectiveDesc')}
              {splitMode === 'fixed' && t('payment.fixedDesc')}
            </Text>
          </Card.Content>
        </Card>

        {/* Guest Payment Cards */}
        {guests.map((guest) => (
          <Card key={guest.id} style={styles.guestCard}>
            <Card.Content>
              <View style={styles.guestHeader}>
                <View style={styles.guestInfo}>
                  <Avatar.Text
                    size={40}
                    label={guest.guest_name.substring(0, 2).toUpperCase()}
                    style={[
                      styles.guestAvatar,
                      guest.is_primary && styles.primaryAvatar,
                    ]}
                  />
                  <View style={styles.guestDetails}>
                    <Text variant="titleSmall" style={styles.guestName}>
                      {guest.guest_name}
                      {guest.is_primary && (
                        <Text style={styles.primaryBadge}> (Host)</Text>
                      )}
                    </Text>
                    <Chip
                      mode="flat"
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            getPaymentStatusColor(guest.payment_status) + '20',
                        },
                      ]}
                      textStyle={{
                        color: getPaymentStatusColor(guest.payment_status),
                        fontSize: 10,
                      }}
                    >
                      {t(`payment.status.${guest.payment_status}`)}
                    </Chip>
                  </View>
                </View>
                <View style={styles.guestAmount}>
                  <Text variant="titleMedium" style={styles.amountText}>
                    R$ {(amounts[guest.id] || 0).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Selective Mode - Item Selection */}
              {splitMode === 'selective' && (
                <View style={styles.itemSelection}>
                  <Divider style={styles.divider} />
                  <Text variant="bodySmall" style={styles.selectItemsLabel}>
                    {t('payment.selectItems')}:
                  </Text>
                  {order.items.map((item) => (
                    <View key={item.id} style={styles.selectableItem}>
                      <Checkbox
                        status={
                          selectedItems[guest.id]?.includes(item.id)
                            ? 'checked'
                            : 'unchecked'
                        }
                        onPress={() => handleToggleItem(guest.id, item.id)}
                      />
                      <View style={styles.itemInfo}>
                        <Text variant="bodyMedium" style={styles.itemText}>
                          {item.quantity}x {item.menu_item.name}
                        </Text>
                        <Text variant="bodySmall" style={styles.itemPrice}>
                          R$ {item.total_price.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Fixed Mode - Amount Input */}
              {splitMode === 'fixed' && (
                <View style={styles.fixedAmountContainer}>
                  <Divider style={styles.divider} />
                  <TextInput
                    label={t('payment.enterAmount')}
                    value={fixedAmounts[guest.id] || ''}
                    onChangeText={(value) =>
                      handleFixedAmountChange(guest.id, value)
                    }
                    keyboardType="decimal-pad"
                    mode="outlined"
                    left={<TextInput.Affix text="R$" />}
                    style={styles.amountInput}
                  />
                </View>
              )}

              {/* Pay Button */}
              {guest.payment_status !== 'paid' && (
                <Button
                  mode="contained"
                  onPress={() => handleOpenPayment(guest)}
                  style={styles.payButton}
                  disabled={allPaid}
                >
                  {t('payment.payNow')}
                </Button>
              )}
            </Card.Content>
          </Card>
        ))}

        {/* Create Splits Button */}
        {splits.length === 0 && (
          <Button
            mode="contained"
            onPress={handleCreateSplits}
            loading={processing}
            disabled={processing}
            style={styles.createSplitsButton}
            icon="credit-card-split"
          >
            {t('payment.createSplits')}
          </Button>
        )}
      </ScrollView>

      {/* Payment Method Modal */}
      <Portal>
        <Modal
          visible={showPaymentModal}
          onDismiss={() => setShowPaymentModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            {t('payment.selectPaymentMethod')}
          </Text>

          {selectedGuest && (
            <View style={styles.paymentSummary}>
              <Text variant="bodyMedium" style={styles.paymentSummaryText}>
                {t('payment.payingFor')}: {selectedGuest.guest_name}
              </Text>
              <Text variant="headlineSmall" style={styles.paymentAmount}>
                R$ {(amounts[selectedGuest.id] || 0).toFixed(2)}
              </Text>
            </View>
          )}

          <RadioButton.Group
            value={paymentMethod}
            onValueChange={setPaymentMethod}
          >
            <RadioButton.Item
              label={t('payment.creditCard')}
              value="credit_card"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
            <RadioButton.Item
              label="PIX"
              value="pix"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
            <RadioButton.Item
              label="Apple Pay"
              value="apple_pay"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
            <RadioButton.Item
              label="Google Pay"
              value="google_pay"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
            <RadioButton.Item
              label={t('payment.wallet')}
              value="wallet"
              style={styles.radioItem}
              labelStyle={{ color: colors.foreground }}
            />
          </RadioButton.Group>

          <View style={styles.modalActions}>
            <Button
              mode="text"
              onPress={() => setShowPaymentModal(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              mode="contained"
              onPress={handleProcessPayment}
              loading={processing}
              disabled={processing}
            >
              {t('payment.confirm')}
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
