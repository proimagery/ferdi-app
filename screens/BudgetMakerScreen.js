import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BudgetMakerScreen({ navigation, route }) {
  const [categories, setCategories] = useState(route.params?.categories || []);
  const [categoryName, setCategoryName] = useState('');
  const [categoryAmount, setCategoryAmount] = useState('');

  const presetCategories = [
    { name: 'Accommodation', icon: 'bed', color: '#60a5fa' },
    { name: 'Food & Dining', icon: 'restaurant', color: '#f472b6' },
    { name: 'Transportation', icon: 'car', color: '#fb923c' },
    { name: 'Activities', icon: 'bicycle', color: '#a78bfa' },
    { name: 'Shopping', icon: 'cart', color: '#34d399' },
    { name: 'Miscellaneous', icon: 'ellipsis-horizontal', color: '#fbbf24' },
  ];

  const addCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }
    if (!categoryAmount.trim() || isNaN(categoryAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const newCategory = {
      name: categoryName,
      budgetAmount: parseFloat(categoryAmount),
      spent: 0,
      icon: 'pricetag',
      color: '#4ade80',
    };

    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    setCategoryName('');
    setCategoryAmount('');

    navigation.setParams({ categories: updatedCategories });
  };

  const addPresetCategory = (preset) => {
    Alert.prompt(
      'Set Budget',
      `Enter budget amount for ${preset.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (amount) => {
            if (amount && !isNaN(amount)) {
              const newCategory = {
                name: preset.name,
                budgetAmount: parseFloat(amount),
                spent: 0,
                icon: preset.icon,
                color: preset.color,
              };
              const updatedCategories = [...categories, newCategory];
              setCategories(updatedCategories);
              navigation.setParams({ categories: updatedCategories });
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const deleteCategory = (index) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    navigation.setParams({ categories: updatedCategories });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Add Presets</Text>
        <View style={styles.presetGrid}>
          {presetCategories.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={styles.presetCard}
              onPress={() => addPresetCategory(preset)}
            >
              <Ionicons name={preset.icon} size={24} color={preset.color} />
              <Text style={styles.presetName}>{preset.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create Custom Category</Text>
        <TextInput
          style={styles.input}
          placeholder="Category name"
          placeholderTextColor="#666"
          value={categoryName}
          onChangeText={setCategoryName}
        />
        <TextInput
          style={styles.input}
          placeholder="Budget amount"
          placeholderTextColor="#666"
          keyboardType="numeric"
          value={categoryAmount}
          onChangeText={setCategoryAmount}
        />
        <TouchableOpacity style={styles.addButton} onPress={addCategory}>
          <Ionicons name="add-circle" size={24} color="#0a0a0a" />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      {categories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Categories</Text>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <Ionicons name={category.icon} size={20} color={category.color} />
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteCategory(index)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              <Text style={styles.categoryBudget}>${category.budgetAmount}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetCard: {
    width: '31%',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  presetName: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 5,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4ade80',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  categoryBudget: {
    fontSize: 18,
    color: '#4ade80',
    marginLeft: 30,
  },
});
