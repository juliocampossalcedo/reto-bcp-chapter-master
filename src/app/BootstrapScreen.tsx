import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function BootstrapScreen(): React.JSX.Element {
  return (
    <View style={styles.container} accessibilityLabel="Pantalla de inicio">
      <Text accessibilityRole="header" style={styles.title}>
        iO Productos & Beneficios
      </Text>
      <Text style={styles.subtitle}>Bootstrap completado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});
