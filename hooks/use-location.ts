import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
    permissionDenied: false,
  });

  const requestLocation = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, permissionDenied: false }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: 'Location permission is required to show nearby restaurants.',
          permissionDenied: true,
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        loading: false,
        error: null,
        permissionDenied: false,
      });
    } catch (error) {
      setState({
        latitude: null,
        longitude: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get location',
        permissionDenied: false,
      });
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...state, retry: requestLocation };
}
