import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingComponentProps {
  color?: string;
  size?: 'large' | 'small';
  style?: object;
  text?: string;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  color = '#007AFF',
  size = 'large',
  style = {},
  text = 'Loading...',
}) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        color={color}
        size={size === 'large' ? 'large' : 'small'}
      />
      {text && <Text style={[styles.text, { color }]}>{text}</Text>}
    </View>
  );
};

// Full screen loading component
export const FullScreenLoading: React.FC<{ text?: string }> = ({
  text = 'Loading...',
}) => {
  return (
    <View
      style={styles.fullScreenContainer}
      testID='full-screen-loading'
    >
      <LoadingComponent text={text} />
    </View>
  );
};

// Button loading component
interface ButtonLoadingProps {
  children: React.ReactNode;
  disabled?: boolean;
  loading: boolean;
  style?: object;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  children,
  disabled = false,
  loading,
  style = {},
}) => {
  return (
    <View style={[styles.buttonContainer, disabled && styles.disabled, style]}>
      {loading ? (
        <ActivityIndicator
          color='#fff'
          size='small'
        />
      ) : (
        children
      )}
    </View>
  );
};

// Skeleton loading component
export const SkeletonLoading: React.FC<{
  height?: number;
  style?: object;
  width?: number;
}> = ({ height = 20, style = {}, width = 200 }) => {
  return (
    <View
      style={[
        styles.skeleton,
        {
          backgroundColor: '#E0E0E0',
          height,
          width,
        },
        style,
      ]}
    />
  );
};

// List skeleton loading component
export const ListSkeletonLoading: React.FC<{ count?: number }> = ({
  count = 3,
}) => {
  return (
    <View style={styles.listContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={styles.listItem}
        >
          <SkeletonLoading
            height={60}
            style={styles.avatar}
            width={60}
          />
          <View style={styles.listItemContent}>
            <SkeletonLoading
              height={20}
              style={styles.title}
              width={150}
            />
            <SkeletonLoading
              height={16}
              style={styles.subtitle}
              width={100}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    marginRight: 16,
  },
  buttonContainer: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  disabled: {
    backgroundColor: '#A0A0A0',
  },
  fullScreenContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  listItemContent: {
    flex: 1,
  },
  skeleton: {
    borderRadius: 4,
    marginVertical: 8,
  },
  subtitle: {
    width: '70%',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
  },
  title: {
    marginBottom: 8,
  },
});
