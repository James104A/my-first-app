import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';

import { ConcertCard } from '@/components/concert-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/contexts/theme-context';
import { useLocation } from '@/hooks/use-location';
import { fetchUpcomingConcerts } from '@/services/bandsintown-api';
import { Concert } from '@/types/concert';

export default function ConcertsScreen() {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { latitude, longitude, loading: locationLoading, error: locationError, permissionDenied, retry: retryLocation } = useLocation();

  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConcerts = useCallback(async (isRefresh = false) => {
    if (!latitude || !longitude) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await fetchUpcomingConcerts(latitude, longitude);
      setConcerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch concerts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (latitude && longitude) {
      fetchConcerts();
    }
  }, [latitude, longitude, fetchConcerts]);

  const handleRefresh = () => {
    fetchConcerts(true);
  };

  const handleRetry = () => {
    if (permissionDenied || locationError) {
      retryLocation();
    } else {
      fetchConcerts();
    }
  };

  // Loading state (location or concerts)
  if (locationLoading || (loading && concerts.length === 0)) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
        <ThemedText style={styles.statusText}>
          {locationLoading ? 'Getting your location...' : 'Finding nearby concerts...'}
        </ThemedText>
      </ThemedView>
    );
  }

  // Permission denied state
  if (permissionDenied) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Location Permission Required
        </ThemedText>
        <ThemedText style={styles.errorText}>
          {locationError}
        </ThemedText>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={handleRetry}>
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // Location error state
  if (locationError) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Location Error
        </ThemedText>
        <ThemedText style={styles.errorText}>{locationError}</ThemedText>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={handleRetry}>
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // API error state
  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          Error
        </ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={handleRetry}>
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // Empty state
  if (concerts.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle" style={styles.errorTitle}>
          No Concerts Found
        </ThemedText>
        <ThemedText style={styles.errorText}>
          No upcoming concerts from popular artists found within 50 miles of your location.
        </ThemedText>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.tint }]}
          onPress={handleRetry}>
          <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  // Success state
  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={concerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConcertCard concert={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
          />
        }
        ListHeaderComponent={
          <ThemedText type="title" style={styles.header}>
            Concerts Nearby
          </ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statusText: {
    marginTop: 12,
    opacity: 0.7,
  },
  errorTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
