import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiGet, apiPost, apiPut, APIError } from '../services/apiClient';
import { SensorOut } from '../types/api';

interface SensorContextType {
  sensorList: SensorOut[];
  updateSensor: (id: string, updates: Partial<SensorOut>) => Promise<void>;
  addSensor: (sensor: Omit<SensorOut, 'id'>) => Promise<void>;
  fetchSensors: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export function SensorProvider({ children }: { children: ReactNode }) {
  const [sensorList, setSensorList] = useState<SensorOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      setError(null);
      const sensors = await apiGet<SensorOut[]>('/api/v1/sensors');
      setSensorList(sensors);
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to fetch sensors';
      setError(message);
      console.error('[SensorContext] Error fetching sensors:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSensor = async (id: string, updates: Partial<SensorOut>) => {
    try {
      setError(null);
      await apiPut(`/api/v1/sensors/${id}`, updates);
      // Refresh the sensor list after update
      await fetchSensors();
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to update sensor';
      setError(message);
      console.error('[SensorContext] Error updating sensor:', err);
      throw err;
    }
  };

  const addSensor = async (sensor: Omit<SensorOut, 'id'>) => {
    try {
      setError(null);
      await apiPost('/api/v1/sensors', sensor);
      // Refresh the sensor list after adding
      await fetchSensors();
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to add sensor';
      setError(message);
      console.error('[SensorContext] Error adding sensor:', err);
      throw err;
    }
  };

  // Fetch sensors on mount
  useEffect(() => {
    fetchSensors();
  }, []);

  return (
    <SensorContext.Provider value={{ sensorList, updateSensor, addSensor, fetchSensors, loading, error }}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensors() {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensors must be used within a SensorProvider');
  }
  return context;
}
