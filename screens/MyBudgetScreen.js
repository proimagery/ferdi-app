import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrencyInfo } from '../utils/currencyData';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function MyBudgetScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { budgets, deleteBudget } = useAppContext();
  const [expandedId, setExpandedId] = useState(null);
  const [selectedCountryForBudget, setSelectedCountryForBudget] = useState({});

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

              // Get currency info - for single country use country name, for multi use first country or USD
              const currencyInfo = budget.tripType === 'single' && budget.country
                ? getCurrencyInfo(budget.country)
                : budget.tripType === 'multi' && budget.countries?.[0]
                  ? getCurrencyInfo(budget.countries[0].name)
                  : { currency: 'USD', symbol: '$', rate: 1.0 };

              const dailyBudgetLocal = dailyBudget * (budget.currencyRate || currencyInfo.rate);

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
                      <Text style={[styles.briefValue, { color: theme.text }]}>${Math.round(dailyBudget).toLocaleString()}</Text>
                    </View>
                  </View>

                  {/* Expanded Details - Only When Expanded */}
                  {isExpanded && (
                    <View style={[styles.expandedContent, { borderTopColor: theme.border }]}>
                      {/* Single Country Mode */}
                      {budget.tripType === 'single' ? (
                        <>
                          {/* Daily Budget with Local Currency */}
                          <View style={[styles.dailyBudgetCard, {
                            backgroundColor: theme.background,
                            borderColor: theme.primary
                          }]}>
                            <Text style={[styles.dailyBudgetLabel, { color: theme.textSecondary }]}>Daily Budget</Text>
                            <Text style={[styles.dailyBudgetValue, { color: theme.primary }]}>
                              ${Math.round(dailyBudget).toLocaleString()} USD / {currencyInfo.symbol}{Math.round(dailyBudgetLocal).toLocaleString()} {currencyInfo.currency}
                            </Text>
                          </View>

                          {/* Accommodation */}
                          <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                              <Ionicons name="bed" size={18} color={theme.primary} />
                              <Text style={[styles.sectionTitle, { color: theme.text }]}>Accommodation</Text>
                            </View>
                            <View style={styles.breakdownRow}>
                              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Total (USD)</Text>
                              <Text style={[styles.breakdownValue, { color: theme.text }]}>${Math.round(budget.accommodation || 0).toLocaleString()}</Text>
                            </View>
                            <View style={styles.breakdownRow}>
                              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Total ({currencyInfo.currency})</Text>
                              <Text style={[styles.breakdownValue, { color: theme.text }]}>
                                {currencyInfo.symbol}{Math.round((budget.accommodation || 0) * currencyInfo.rate).toLocaleString()}
                              </Text>
                            </View>
                            <View style={styles.breakdownRow}>
                              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Per Day (USD)</Text>
                              <Text style={[styles.breakdownValue, { color: theme.text }]}>
                                ${Math.round((budget.accommodation || 0) / budget.tripDuration).toLocaleString()}
                              </Text>
                            </View>
                            <View style={styles.breakdownRow}>
                              <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>Per Day ({currencyInfo.currency})</Text>
                              <Text style={[styles.breakdownValue, { color: theme.text }]}>
                                {currencyInfo.symbol}{Math.round(((budget.accommodation || 0) * currencyInfo.rate) / budget.tripDuration).toLocaleString()}
                              </Text>
                            </View>
                          </View>

                          {/* Budget Breakdown */}
                          {budget.lineItems && budget.lineItems.length > 0 && (
                            <View style={styles.section}>
                              <Text style={[styles.sectionTitle, { color: theme.text }]}>Budget Breakdown</Text>
                              {budget.lineItems.map((item, idx) => {
                                const itemLocal = (item.total || 0) * currencyInfo.rate;
                                const itemDailyLocal = ((item.total || 0) / budget.tripDuration) * currencyInfo.rate;
                                return (
                                  <View key={idx} style={[styles.lineItemRow, { borderBottomColor: theme.border }]}>
                                    <View style={styles.lineItemInfo}>
                                      <Text style={[styles.lineItemName, { color: theme.text }]}>{item.name}</Text>
                                      <Text style={[styles.lineItemPercent, { color: theme.primary }]}>{item.percent}%</Text>
                                    </View>
                                    <View style={styles.lineItemAmounts}>
                                      <Text style={[styles.lineItemTotal, { color: theme.text }]}>${Math.round(item.total || 0).toLocaleString()} USD</Text>
                                      <Text style={[styles.lineItemLocalTotal, { color: theme.textSecondary }]}>
                                        {currencyInfo.symbol}{Math.round(itemLocal).toLocaleString()} {currencyInfo.currency}
                                      </Text>
                                      <Text style={[styles.lineItemDaily, { color: theme.textSecondary }]}>
                                        ${Math.round((item.total || 0) / budget.tripDuration).toLocaleString()}/day | {currencyInfo.symbol}{Math.round(itemDailyLocal).toLocaleString()}/day
                                      </Text>
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          )}

                          {/* Summary */}
                          <View style={[styles.summaryCard, {
                            backgroundColor: theme.background,
                            borderColor: theme.primary
                          }]}>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Budget Remaining After All Expenses</Text>
                            <Text style={[styles.summaryValue, { color: theme.primary }]}>
                              ${(budget.totalBudget - (budget.accommodation || 0) -
                                (budget.lineItems || []).reduce((sum, item) => sum + (item.total || 0), 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                          </View>
                        </>
                      ) : (
                        /* Multi-Country Mode */
                        <>
                          {/* Overall Budget Summary */}
                          <View style={[styles.dailyBudgetCard, {
                            backgroundColor: theme.background,
                            borderColor: theme.primary
                          }]}>
                            <Text style={[styles.dailyBudgetLabel, { color: theme.textSecondary }]}>Total Trip Budget</Text>
                            <Text style={[styles.dailyBudgetValue, { color: theme.primary }]}>
                              ${budget.totalBudget.toLocaleString()} USD
                            </Text>
                            <Text style={[styles.tripSummaryText, { color: theme.textSecondary }]}>
                              {budget.countries?.length || 0} countries • {budget.tripDuration} days
                            </Text>
                          </View>

                          {/* Country Selector for Multi-Country */}
                          {budget.countries && budget.countries.length > 0 && (
                            <View style={styles.section}>
                              <Text style={[styles.sectionTitle, { color: theme.text }]}>Budget by Country</Text>

                              {/* Country Toggle */}
                              <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.countryToggleScroll}
                                contentContainerStyle={styles.countryToggleContent}
                              >
                                {budget.countries.map((country, countryIdx) => {
                                  const selectedCountry = selectedCountryForBudget[budget.id] || budget.countries[0]?.name;
                                  const isSelected = selectedCountry === country.name;
                                  return (
                                    <TouchableOpacity
                                      key={countryIdx}
                                      style={[
                                        styles.countryToggleBtn,
                                        { backgroundColor: theme.cardBackground, borderColor: theme.border },
                                        isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
                                      ]}
                                      onPress={() => setSelectedCountryForBudget(prev => ({
                                        ...prev,
                                        [budget.id]: country.name
                                      }))}
                                    >
                                      <Text style={[
                                        styles.countryToggleName,
                                        { color: theme.text },
                                        isSelected && { color: theme.background }
                                      ]}>
                                        {country.name}
                                      </Text>
                                      <Text style={[
                                        styles.countryToggleDays,
                                        { color: theme.textSecondary },
                                        isSelected && { color: theme.background + '99' }
                                      ]}>
                                        {country.days} days • {country.symbol}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                })}
                              </ScrollView>

                              {/* Selected Country Breakdown */}
                              {(() => {
                                const selectedCountryName = selectedCountryForBudget[budget.id] || budget.countries[0]?.name;
                                const countryBreakdown = budget.countryBreakdowns?.[selectedCountryName];
                                const countryData = budget.countries.find(c => c.name === selectedCountryName);

                                if (!countryBreakdown || !countryData) return null;

                                return (
                                  <View style={[styles.countryBreakdownCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                                    {/* Country Budget Header */}
                                    <View style={styles.countryBudgetHeader}>
                                      <View>
                                        <Text style={[styles.countryBudgetTitle, { color: theme.text }]}>{selectedCountryName}</Text>
                                        <Text style={[styles.countryBudgetSubtitle, { color: theme.textSecondary }]}>
                                          {countryData.days} days • {countryData.currency} ({countryData.symbol})
                                        </Text>
                                      </View>
                                      <View style={styles.countryBudgetAmount}>
                                        <Text style={[styles.countryBudgetValue, { color: theme.primary }]}>
                                          ${Math.round(countryBreakdown.budget).toLocaleString()}
                                        </Text>
                                        <Text style={[styles.countryBudgetLocal, { color: theme.textSecondary }]}>
                                          {countryData.symbol}{Math.round(countryBreakdown.budget * countryData.rate).toLocaleString()}
                                        </Text>
                                      </View>
                                    </View>

                                    {/* Accommodation for this country */}
                                    {countryBreakdown.accommodation > 0 && (
                                      <View style={[styles.countryAccommodation, { borderTopColor: theme.border }]}>
                                        <View style={styles.countryAccomHeader}>
                                          <Ionicons name="bed" size={16} color={theme.primary} />
                                          <Text style={[styles.countryAccomLabel, { color: theme.textSecondary }]}>Accommodation</Text>
                                        </View>
                                        <Text style={[styles.countryAccomValue, { color: theme.text }]}>
                                          ${Math.round(countryBreakdown.accommodation).toLocaleString()} • {countryData.symbol}{Math.round(countryBreakdown.accommodation * countryData.rate).toLocaleString()}
                                        </Text>
                                      </View>
                                    )}

                                    {/* After Accommodation Budget */}
                                    <View style={[styles.afterAccomRow, { backgroundColor: theme.primary + '15' }]}>
                                      <Text style={[styles.afterAccomLabel, { color: theme.textSecondary }]}>
                                        {countryBreakdown.accommodation > 0 ? 'After Accommodation' : 'Daily Budget'}
                                      </Text>
                                      <Text style={[styles.afterAccomValue, { color: theme.primary }]}>
                                        ${Math.round(countryBreakdown.budgetAfterAccommodation).toLocaleString()} • {countryData.symbol}{Math.round(countryBreakdown.budgetAfterAccommodation * countryData.rate).toLocaleString()}
                                      </Text>
                                    </View>

                                    {/* Line Items for this country */}
                                    {countryBreakdown.lineItems && countryBreakdown.lineItems.length > 0 && (
                                      <View style={styles.countryLineItems}>
                                        <Text style={[styles.lineItemsHeader, { color: theme.text }]}>Spending Categories</Text>
                                        {countryBreakdown.lineItems.map((item, itemIdx) => {
                                          const perDay = countryData.days > 0 ? item.total / countryData.days : 0;
                                          const perDayLocal = perDay * countryData.rate;
                                          return (
                                            <View key={itemIdx} style={[styles.countryLineItem, { borderBottomColor: theme.border }]}>
                                              <View style={styles.lineItemLeft}>
                                                <Text style={[styles.lineItemNameSmall, { color: theme.text }]}>{item.name}</Text>
                                                <Text style={[styles.lineItemPercentSmall, { color: theme.primary }]}>{item.percent}%</Text>
                                              </View>
                                              <View style={styles.lineItemRight}>
                                                <Text style={[styles.lineItemTotalSmall, { color: theme.text }]}>
                                                  ${Math.round(item.total).toLocaleString()} • {countryData.symbol}{Math.round(item.totalLocal || item.total * countryData.rate).toLocaleString()}
                                                </Text>
                                                <Text style={[styles.lineItemDailySmall, { color: theme.textSecondary }]}>
                                                  ${Math.round(perDay).toLocaleString()}/day • {countryData.symbol}{Math.round(perDayLocal).toLocaleString()}/day
                                                </Text>
                                              </View>
                                            </View>
                                          );
                                        })}
                                      </View>
                                    )}
                                  </View>
                                );
                              })()}
                            </View>
                          )}

                          {/* Total Accommodations Summary */}
                          {budget.accommodation > 0 && (
                            <View style={[styles.totalAccomSummary, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                              <Ionicons name="bed" size={18} color={theme.primary} />
                              <Text style={[styles.totalAccomText, { color: theme.textSecondary }]}>
                                Total Accommodations: ${Math.round(budget.accommodation).toLocaleString()}
                              </Text>
                            </View>
                          )}
                        </>
                      )}

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

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
        </View>
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
    marginBottom: 2,
  },
  lineItemLocalTotal: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  lineItemDaily: {
    fontSize: 11,
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
  // Multi-country budget display styles
  tripSummaryText: {
    fontSize: 12,
    marginTop: 5,
  },
  countryToggleScroll: {
    marginBottom: 15,
  },
  countryToggleContent: {
    paddingVertical: 5,
  },
  countryToggleBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 90,
  },
  countryToggleName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  countryToggleDays: {
    fontSize: 10,
    marginTop: 2,
  },
  countryBreakdownCard: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  countryBudgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  countryBudgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  countryBudgetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  countryBudgetAmount: {
    alignItems: 'flex-end',
  },
  countryBudgetValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  countryBudgetLocal: {
    fontSize: 12,
    marginTop: 2,
  },
  countryAccommodation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  countryAccomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryAccomLabel: {
    fontSize: 13,
  },
  countryAccomValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  afterAccomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  afterAccomLabel: {
    fontSize: 12,
  },
  afterAccomValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  countryLineItems: {
    padding: 15,
    paddingTop: 10,
  },
  lineItemsHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  countryLineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  lineItemLeft: {
    flex: 1,
  },
  lineItemRight: {
    alignItems: 'flex-end',
  },
  lineItemNameSmall: {
    fontSize: 13,
    marginBottom: 2,
  },
  lineItemPercentSmall: {
    fontSize: 11,
  },
  lineItemTotalSmall: {
    fontSize: 13,
    fontWeight: '600',
  },
  lineItemDailySmall: {
    fontSize: 11,
  },
  totalAccomSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
  },
  totalAccomText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
});
