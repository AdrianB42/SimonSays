// index.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AuthScreen from '@/components/AuthScreen';
import TiltDirectionDetector from '@/components/TiltDirectionDetector';

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthComplete = () => {
    setIsAuthenticated(true);
  };

  return (
      <View style={styles.container}>
        {isAuthenticated ? (
            <TiltDirectionDetector />
        ) : (
            <AuthScreen onAuthComplete={handleAuthComplete} />
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
