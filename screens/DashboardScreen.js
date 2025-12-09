import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }) {
  const features = [
    {
      title: 'My Trips',
      description: 'Plan and manage your trips',
      icon: 'airplane',
      color: '#4ade80',
      screen: 'MyTrips',
    },
    {
      title: 'Budget Maker',
      description: 'Create budget categories',
      icon: 'calculator',
      color: '#60a5fa',
      screen: 'BudgetMaker',
    },
    {
      title: 'My Budget',
      description: 'Track your expenses',
      icon: 'wallet',
      color: '#f472b6',
      screen: 'MyBudget',
    },
    {
      title: 'Travel Mapper',
      description: 'Visualize your travels',
      icon: 'map',
      color: '#fb923c',
      screen: 'TravelMapper',
    },
    {
      title: 'Your Stats',
      description: 'View travel statistics',
      icon: 'stats-chart',
      color: '#a78bfa',
      screen: 'YourStats',
    },
    {
      title: 'World Rank',
      description: 'Explore country rankings',
      icon: 'globe',
      color: '#34d399',
      screen: 'WorldRank',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Choose a feature to get started</Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => navigation.navigate(feature.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
              <Ionicons name={feature.icon} size={32} color={feature.color} />
            </View>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  grid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#888888',
  },
});
