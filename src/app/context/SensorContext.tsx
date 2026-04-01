import { createContext, useContext, useState, ReactNode } from 'react';
import { sensors, Sensor } from '../data/mockData';

interface SensorContextType {
  sensorList: Sensor[];
  updateSensor: (id: string, updates: Partial<Sensor>) => void;
  addSensor: (sensor: Sensor) => void;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export function SensorProvider({ children }: { children: ReactNode }) {
  const [sensorList, setSensorList] = useState<Sensor[]>(sensors);

  const updateSensor = (id: string, updates: Partial<Sensor>) => {
    setSensorList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const addSensor = (sensor: Sensor) => {
    setSensorList((prev) => [...prev, sensor]);
  };

  return (
    <SensorContext.Provider value={{ sensorList, updateSensor, addSensor }}>
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
