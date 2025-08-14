import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ErrorComponent } from './ErrorComponent';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'auth' | 'network' | 'unknown' | 'validation';
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
    errorInfo: null,
    errorType: 'unknown',
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = categorizeError(error);
    return { error, errorInfo: null, errorType, hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
      errorType: categorizeError(error),
    });
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || this.renderFallback();
    }

    return this.props.children;
  }

  private handleRetry = () => {
    this.setState({
      error: null,
      errorInfo: null,
      errorType: 'unknown',
      hasError: false,
    });
  };

  private renderFallback = () => {
    if (this.state.error) {
      const { error, errorType } = this.state;
      let title = 'Something went wrong';
      let message = 'An unexpected error occurred. Please try again.';

      // Customize error message based on error type
      switch (errorType) {
        case 'auth':
          title = 'Authentication Error';
          message =
            'There was a problem with your authentication. Please try logging in again.';
          break;
        case 'network':
          title = 'Connection Error';
          message =
            'Unable to connect to the server. Please check your internet connection and try again.';
          break;
        case 'validation':
          title = 'Validation Error';
          message =
            'The information you provided contains errors. Please check and try again.';
          break;
        default:
          title = 'Something went wrong';
          message = 'An unexpected error occurred. Please try again.';
      }

      return (
        <ErrorComponent
          error={error.message}
          errorType={errorType}
          message={message}
          onRetry={this.handleRetry}
          title={title}
        />
      );
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Oops, something went wrong</Text>
        <Text style={styles.message}>
          An unexpected error occurred. Please try again.
        </Text>
        <TouchableOpacity
          onPress={this.handleRetry}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  };
}

// Helper function to categorize errors
function categorizeError(
  error: Error,
): 'auth' | 'network' | 'unknown' | 'validation' {
  const errorMessage = error.message.toLowerCase();

  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  ) {
    return 'network';
  }

  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('signin') ||
    errorMessage.includes('login')
  ) {
    return 'auth';
  }

  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('format')
  ) {
    return 'validation';
  }

  return 'unknown';
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    color: '#6c757d',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  title: {
    color: '#dc3545',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
