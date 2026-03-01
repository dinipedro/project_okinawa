/**
 * CallWaiterScreen
 * 
 * Allows customers to discreetly request waiter assistance
 * with various service needs including order help, bill request,
 * and special requests.
 * 
 * @module screens/service
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput, IconButton, ActivityIndicator, RadioButton, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import ApiService from '@/shared/services/api';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@/shared/theme';

interface CallReason {
  id: string;
  icon: string;
  title: string;
  description: string;
  priority: 'normal' | 'high';
}

const CALL_REASONS: CallReason[] = [
  {
    id: 'question',
    icon: 'help-circle',
    title: 'Dúvida sobre o cardápio',
    description: 'Perguntas sobre ingredientes, preparo ou recomendações',
    priority: 'normal',
  },
  {
    id: 'special_request',
    icon: 'food-variant',
    title: 'Pedido especial',
    description: 'Modificações no pedido ou solicitações específicas',
    priority: 'normal',
  },
  {
    id: 'accessibility',
    icon: 'wheelchair-accessibility',
    title: 'Assistência de acessibilidade',
    description: 'Ajuda para locomoção ou necessidades especiais',
    priority: 'high',
  },
  {
    id: 'problem',
    icon: 'alert-circle',
    title: 'Reportar problema',
    description: 'Qualidade da comida, item incorreto ou outros problemas',
    priority: 'high',
  },
];

export default function CallWaiterScreen() {
  useScreenTracking('Call Waiter');
  const { t } = useI18n();
  const colors = useColors();
  const route = useRoute();
  const navigation = useNavigation();
  const analytics = useAnalytics();

  const { restaurantId, reservationId, tableId } = route.params as {
    restaurantId: string;
    reservationId?: string;
    tableId?: string;
  };

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [callSent, setCallSent] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);

  const handleCallWaiter = async () => {
    if (!selectedReason) {
      Alert.alert('Selecione um motivo', 'Por favor, selecione o motivo da chamada.');
      return;
    }

    const reason = CALL_REASONS.find(r => r.id === selectedReason);
    if (!reason) return;

    setSending(true);
    try {
      const response = await ApiService.callWaiter(restaurantId, {
        reservation_id: reservationId,
        table_id: tableId,
        reason: reason.title,
        message: additionalMessage || undefined,
        priority: reason.priority,
      });

      await analytics.logEvent('waiter_called', {
        restaurant_id: restaurantId,
        reason: selectedReason,
        priority: reason.priority,
      });

      setCallId(response.id);
      setCallSent(true);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.message || t('errors.generic'));
    } finally {
      setSending(false);
    }
  };

  const handleCancelCall = async () => {
    if (!callId) return;

    Alert.alert(
      'Cancelar chamada',
      'Tem certeza que deseja cancelar a chamada do garçom?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await ApiService.cancelWaiterCall(callId);
              await analytics.logEvent('waiter_call_cancelled', {
                call_id: callId,
              });
              setCallSent(false);
              setCallId(null);
              setSelectedReason(null);
              setAdditionalMessage('');
            } catch (error: any) {
              Alert.alert(t('common.error'), error.response?.data?.message || t('errors.generic'));
            }
          },
        },
      ]
    );
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 15,
    },
    title: {
      marginBottom: 8,
      color: colors.foreground,
    },
    subtitle: {
      color: colors.foregroundSecondary,
      marginBottom: 20,
    },
    card: {
      marginBottom: 15,
      backgroundColor: colors.card,
    },
    sectionTitle: {
      marginBottom: 15,
      color: colors.foreground,
    },
    reasonItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderRadius: 8,
    },
    reasonItemSelected: {
      backgroundColor: colors.warningBackground,
    },
    reasonIcon: {
      marginRight: 8,
    },
    reasonContent: {
      flex: 1,
    },
    reasonTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    reasonTitle: {
      fontWeight: '500',
      color: colors.foreground,
    },
    reasonTitleSelected: {
      color: colors.primary,
      fontWeight: '600',
    },
    priorityIcon: {
      margin: 0,
      marginLeft: 4,
    },
    reasonDescription: {
      color: colors.foregroundSecondary,
      marginTop: 2,
    },
    divider: {
      marginVertical: 4,
    },
    messageInput: {
      backgroundColor: colors.input,
    },
    noteCard: {
      marginBottom: 15,
      backgroundColor: colors.warningBackground,
    },
    noteContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    noteText: {
      flex: 1,
      color: colors.foregroundSecondary,
    },
    callButton: {
      marginBottom: 30,
      backgroundColor: colors.primary,
      paddingVertical: 8,
    },
    successContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },
    successTitle: {
      marginTop: 16,
      textAlign: 'center',
      color: colors.foreground,
    },
    successMessage: {
      marginTop: 8,
      textAlign: 'center',
      color: colors.foregroundSecondary,
    },
    waitingCard: {
      marginTop: 30,
      width: '100%',
      backgroundColor: colors.warningBackground,
    },
    waitingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    waitingText: {
      marginLeft: 12,
      color: colors.primary,
    },
    cancelCallButton: {
      marginTop: 30,
      borderColor: colors.error,
    },
    backButton: {
      marginTop: 15,
    },
  }), [colors]);

  if (callSent) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <IconButton icon="check-circle" size={80} iconColor={colors.success} />
          <Text variant="headlineSmall" style={styles.successTitle}>
            Garçom notificado!
          </Text>
          <Text variant="bodyMedium" style={styles.successMessage}>
            Um membro da equipe virá atendê-lo em breve.
          </Text>

          <Card style={styles.waitingCard}>
            <Card.Content>
              <View style={styles.waitingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text variant="bodyMedium" style={styles.waitingText}>
                  Aguardando atendimento...
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Button
            mode="outlined"
            onPress={handleCancelCall}
            style={styles.cancelCallButton}
            textColor={colors.error}
            icon="close"
          >
            Cancelar chamada
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            textColor={colors.primary}
          >
            Voltar
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Chamar Garçom
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Selecione o motivo da chamada para que possamos atendê-lo melhor.
      </Text>

      {/* Reason Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Motivo da chamada
          </Text>

          <RadioButton.Group value={selectedReason || ''} onValueChange={setSelectedReason}>
            {CALL_REASONS.map((reason, index) => (
              <React.Fragment key={reason.id}>
                <TouchableOpacity
                  style={[
                    styles.reasonItem,
                    selectedReason === reason.id && styles.reasonItemSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <View style={styles.reasonIcon}>
                    <IconButton
                      icon={reason.icon}
                      size={24}
                      iconColor={selectedReason === reason.id ? colors.primary : colors.foregroundSecondary}
                    />
                  </View>
                  <View style={styles.reasonContent}>
                    <View style={styles.reasonTitleRow}>
                      <Text
                        variant="bodyLarge"
                        style={[
                          styles.reasonTitle,
                          selectedReason === reason.id && styles.reasonTitleSelected,
                        ]}
                      >
                        {reason.title}
                      </Text>
                      {reason.priority === 'high' && (
                        <IconButton icon="alert" size={16} iconColor={colors.error} style={styles.priorityIcon} />
                      )}
                    </View>
                    <Text variant="bodySmall" style={styles.reasonDescription}>
                      {reason.description}
                    </Text>
                  </View>
                  <RadioButton value={reason.id} color={colors.primary} />
                </TouchableOpacity>
                {index < CALL_REASONS.length - 1 && <Divider style={styles.divider} />}
              </React.Fragment>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      {/* Additional Message */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Mensagem adicional (opcional)
          </Text>
          <TextInput
            value={additionalMessage}
            onChangeText={setAdditionalMessage}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Descreva detalhes adicionais se necessário..."
            style={styles.messageInput}
          />
        </Card.Content>
      </Card>

      {/* Info Note */}
      <Card style={styles.noteCard}>
        <Card.Content>
          <View style={styles.noteContainer}>
            <IconButton icon="information" size={24} iconColor={colors.primary} />
            <Text variant="bodySmall" style={styles.noteText}>
              O pagamento é realizado pelo aplicativo. Não é necessário chamar o garçom para solicitar a conta.
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleCallWaiter}
        loading={sending}
        disabled={sending || !selectedReason}
        style={styles.callButton}
        buttonColor={colors.primary}
        icon="bell-ring"
      >
        Chamar Garçom
      </Button>
    </ScrollView>
  );
}
