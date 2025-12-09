import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MyBudgetScreen({ route }) {
  const [categories, setCategories] = useState(route.params?.categories || []);

  const addExpense = (index) => {
    Alert.prompt(
      'Add Expense',
      `Enter amount spent for ${categories[index].name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (amount) => {
            if (amount && !isNaN(amount)) {
              const newCategories = [...categories];
              newCategories[index].spent += parseFloat(amount);
              setCategories(newCategories);
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const getProgressPercentage = (spent, budget) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#fbbf24';
    return '#4ade80';
  };

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budgetAmount, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Budget Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Budget</Text>
            <Text style={styles.summaryValue}>${totalBudget.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
              ${totalSpent.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Remaining</Text>
            <Text style={[styles.summaryValue, { color: '#4ade80' }]}>
              ${(totalBudget - totalSpent).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {categories.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={80} color="#888888" />
          <Text style={styles.emptyTitle}>No budget categories</Text>
          <Text style={styles.emptySubtitle}>
            Create categories in Budget Maker first
          </Text>
        </View>
      ) : (
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => {
            const percentage = getProgressPercentage(category.spent, category.budgetAmount);
            const progressColor = getProgressColor(category.spent, category.budgetAmount);
            const remaining = category.budgetAmount - category.spent;

            return (
              <View key={index} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryTitleRow}>
                    <Ionicons name={category.icon} size={24} color={category.color} />
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addExpenseButton}
                    onPress={() => addExpense(index)}
                  >
                    <Ionicons name="add-circle" size={24} color="#4ade80" />
                  </TouchableOpacity>
                </View>

                <View style={styles.amountRow}>
                  <Text style={styles.spentText}>
                    ${category.spent.toFixed(2)} / ${category.budgetAmount.toFixed(2)}
                  </Text>
                  <Text style={[styles.remainingText, { color: remaining >= 0 ? '#4ade80' : '#ef4444' }]}>
                    {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
                  </Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${percentage}%`, backgroundColor: progressColor },
                    ]}
                  />
                </View>

                {category.spent > category.budgetAmount && (
                  <View style={styles.warningBanner}>
                    <Ionicons name="warning" size={16} color="#ef4444" />
                    <Text style={styles.warningText}>Over budget!</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  summaryCard: {
    backgroundColor: '#1a1a1a',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
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
  categoriesContainer: {
    padding: 20,
    paddingTop: 0,
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addExpenseButton: {
    padding: 5,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  spentText: {
    fontSize: 16,
    color: '#ffffff',
  },
  remainingText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 5,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
