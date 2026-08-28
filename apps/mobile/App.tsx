import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
      <View style={styles.header}>
        <Text style={styles.logoText}>⚡ Settl</Text>
        <Text style={styles.tagline}>Split fair, settle smart.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mobile Engine Ready</Text>
        <Text style={styles.cardBody}>
          Expo + React Native mobile app configured with EAS Build profile (com.settl.app) for Google Play Store deployment.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1e293b',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    maxWidth: 340,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 20,
  },
});
