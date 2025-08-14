import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorComponentProps {
  error: string;
  errorType?: 'auth' | 'network' | 'unknown' | 'validation';
  message?: string;
  onRetry?: () => void;
  title?: string;
}

export const ErrorComponent: React.FC<ErrorComponentProps> = ({
  error,
  errorType = 'unknown',
  message,
  onRetry,
  title = 'An error occurred',
}) => {
  // Get icon based on error type
  const getErrorIcon = () => {
    switch (errorType) {
      case 'auth':
        return '🔐';
      case 'network':
        return '🌐';
      case 'validation':
        return '⚠️';
      default:
        return '❌';
    }
  };

  // Get color based on error type
  const getErrorColor = () => {
    switch (errorType) {
      case 'auth':
        return '#4ECDC4';
      case 'network':
        return '#FF6B6B';
      case 'validation':
        return '#FFD93D';
      default:
        return '#6C757D';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, { color: getErrorColor() }]}>
        {getErrorIcon()}
      </Text>
      <Text style={styles.title}>{title}</Text>
      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : (
        <Text style={styles.error}>{error}</Text>
      )}
      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={[styles.retryButton, { backgroundColor: getErrorColor() }]}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  error: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 15,
  },
  message: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
