import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function MyBudgetScreen({ navigation }) {
  const { theme } = useTheme();
  const { budgets, deleteBudget } = useAppContext();
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEdit = (budget, index) => {
    // Navigate to Budget Maker with edit mode
    navigation.navigate('BudgetMaker', {
      editMode: true,
      budget: budget,
      budgetIndex: index,
    });
  };

  const handleDelete = (index) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteBudget(index),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        {budgets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No budgets yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Create your first budget in Budget Maker
            </Text>
          </View>
        ) : (
          <View style={styles.budgetsContainer}>
            {budgets.map((budget, index) => {
              const isExpanded = expandedId === budget.id;
              const dailyBudget = budget.totalBudget / budget.tripDuration;
              const dailyBudgetLocal = (budget.totalBudget * budget.currencyRate) / budget.tripDuration;

              return (
                <View key={budget.id} style={[styles.budgetCard, {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}>
                  {/* Collapsed View - Always Visible */}
                  <TouchableOpacity
                    style={styles.budgetHeader}
                    onPress={() => toggleExpand(budget.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.headerLeft}>
                      <View style={styles.budgetTitleRow}>
                        <Ionicons
                          name={budget.source === 'trip' ? 'airplane' : 'location'}
                          size={24}
                          color={theme.primary}
                        />
                        <Text style={[styles.budgetCountry, { color: theme.text }]}>
                          {budget.tripType === 'multi' && budget.countries
                            ? `${budget.countries[0]?.name || 'Multi-Country'}...`
                            : budget.country}
                        </Text>
                      </View>
                      {/* Source Badge */}
                      <View style={[styles.sourceBadge, {
                        backgroundColor: budget.source === 'trip' ? theme.secondary : theme.primary
                      }]}>
                        <Text style={[styles.sourceBadgeText, { color: theme.background }]}>
                          {budget.source === 'trip' ? 'Created Trip' : 'Budget Maker'}
                        </Text>
                      </View>
                      {budget.mode === 'recommended' && budget.preset && (
                        <View style={[styles.presetBadge, { backgroundColor: theme.primary }]}>
                          <Text style={[styles.presetBadgeText, { color: theme.background }]}>
                            {budget.preset.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={24}
                      color={theme.primary}
                    />
                  </TouchableOpacity>

                  {/* Brief Info - Always Visible */}
                  <View style={styles.briefInfo}>
                    <View style={[styles.briefItem, {
                      backgroundColor: theme.background,
                      borderColor: theme.border
                    }]}>
                      <Text style={[styles.briefLabel, { color: theme.textSecondary }]}>Total Budget</Text>
                      <Text style={[styles.briefValue, { color: theme.text }]}>${budget.totalBudget.toLocaleString()}</Text>
                    </View>
                    <View style={[styles.briefItem, {
                      backgroundColor: theme.background,
                      borderColor: theme.border
                    }]}>
                      <Text style={[styles.briefLabel, { color: theme.textSecondary }]}>Duration</Text>
                      <Text style={[styles.briefValue, { color: theme.text }]}>{budget.tripDuration} days</Text>
                    </View>
                    <View style={[styles.briefItem, {
                      backgroundColor: theme.background,
                      borderColor: theme.border
                    }]}>
                      <Text style={[styles.briefLabel, { color: theme.textSecondary }]}>Daily Budget</Text>
                      <Text style={[styles.briefValue, { color: theme.text }]}>${dailyBudget.toFixed(0)}</Text>
                    </View>
                  </View>

                  {/* Expanded Details - Only When Expanded */}
                  {isExpanded && (
                    <View style={[styles.expandedContent, { borderTopColor: theme.border }]}>
                      {/* Daily Budget with Local Currency */}
                      <View style={[styles.dailyBudgetCard, {
                        backgroundColor: theme.background,
                        borderColor: theme.primary
                      }]}>
                        <Text style={[styles.dailyBudgetLabel, { color: theme.textSecondary }]}>Daily Budget (Local)</Text>
                        <Text style={[styles.dailyBudgetValue, { color: theme.primary }]}>
                          ${dailyBudget.toFixed(2)} / {budget.currency} {dailyBudgetLocal.toFixed(0)}
                        </Text>
                      </View>

                      {/* Accommodation */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Ionicons name="bed" size={18} color={theme.primary} />
                          <Text style={[styles.sectionTitle, { color: theme.text }]}>Accommodation</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Total</Text>
                          <Text style={[styles.breakdownValue, { color: theme.text }]}>${budget.accommodation.toFixed(0)}</Text>
                        </View>
                        <View style={styles.breakdownRow}>
                          <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Per Day</Text>
                          <Text style={[styles.breakdownValue, { color: theme.text }]}>
                            ${(budget.accommodation / budget.tripDuration).toFixed(0)}
                          </Text>
                        </View>
                      </View>

                      {/* Budget Breakdown */}
                      <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Budget Breakdown</Text>
                        {budget.lineItems.map((item, idx) => (
                          <View key={idx} style={[styles.lineItemRow, { borderBottomColor: theme.border }]}>
                            <View style={styles.lineItemInfo}>
                              <Text style={[styles.lineItemName, { color: theme.text }]}>{item.name}</Text>
                              <Text style={[styles.lineItemPercent, { color: theme.primary }]}>{item.percent}%</Text>
                            </View>
                            <View style={styles.lineItemAmounts}>
                              <Text style={[styles.lineItemTotal, { color: theme.text }]}>${item.total.toFixed(0)}</Text>
                              <Text style={[styles.lineItemDaily, { color: theme.textSecondary }]}>
                                ${(item.total / budget.tripDuration).toFixed(0)}/day
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Summary */}
                      <View style={[styles.summaryCard, {
                        backgroundColor: theme.background,
                        borderColor: theme.primary
                      }]}>
                        <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Budget Remaining After All Expenses</Text>
                        <Text style={[styles.summaryValue, { color: theme.primary }]}>
                          ${(budget.totalBudget - budget.accommodation -
                            budget.lineItems.reduce((sum, item) => sum + item.total, 0)).toFixed(2)}
                        </Text>
                      </View>

                      {/* Action Buttons */}
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.editButton, { backgroundColor: theme.primary }]}
                          onPress={() => handleEdit(budget, index)}
                        >
                          <Ionicons name="pencil" size={20} color={theme.background} />
                          <Text style={[styles.editButtonText, { color: theme.background }]}>Edit Budget</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.deleteButton, {
                            backgroundColor: theme.cardBackground,
                            borderColor: theme.danger
                          }]}
                          onPress={() => handleDelete(index)}
                        >
                          <Ionicons name="trash-outline" size={20} color={theme.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Create Budget Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('BudgetMaker')}
      >
        <Ionicons name="add" size={30} color={theme.background} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  budgetsContainer: {
    padding: 20,
  },
  budgetCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 10,
  },
  budgetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  budgetCountry: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 6,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  presetBadge: {
    backgroundColor: '#4ade80',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginTop: 6,
  },
  presetBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  briefInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  briefItem: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  briefLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
  },
  briefValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  expandedContent: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  dailyBudgetCard: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4ade80',
    marginBottom: 20,
    alignItems: 'center',
  },
  dailyBudgetLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  dailyBudgetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#888',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  lineItemInfo: {
    flex: 1,
  },
  lineItemName: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 3,
  },
  lineItemPercent: {
    fontSize: 12,
    color: '#4ade80',
  },
  lineItemAmounts: {
    alignItems: 'flex-end',
  },
  lineItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  lineItemDaily: {
    fontSize: 12,
    color: '#888',
  },
  summaryCard: {
    backgroundColor: '#0a0a0a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4ade80',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 5,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ade80',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  editButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ade80',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
