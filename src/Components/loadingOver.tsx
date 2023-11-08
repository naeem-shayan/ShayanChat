import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';

export default function LoadingOver() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#5b3a70" />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#ffffff50',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
});
