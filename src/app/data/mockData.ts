export interface Sensor {
  id: string;
  type: 'Radar' | 'Lidar';
  status: 'Active' | 'Offline' | 'Error';
  location: string;
  lastUpdated: string;
  position: { x: number; y: number }; // Map coordinates (percentage)
  coverageRadius: number; // in percentage
}

export interface Threat {
  id: string;
  threat: string;
  sensorId: string;
  sensorType: 'Radar' | 'Lidar';
  location: string;
  severity: 'High' | 'Medium' | 'Low';
  time: string;
}

export interface LiveAlert extends Threat {
  isNew?: boolean;
}

export const sensors: Sensor[] = [
  {
    id: 'R-001',
    type: 'Radar',
    status: 'Active',
    location: 'North Gate',
    lastUpdated: '18 Mar 2025, 14:32',
    position: { x: 50, y: 20 },
    coverageRadius: 15,
  },
  {
    id: 'R-002',
    type: 'Radar',
    status: 'Active',
    location: 'South Perimeter',
    lastUpdated: '18 Mar 2025, 14:30',
    position: { x: 50, y: 80 },
    coverageRadius: 15,
  },
  {
    id: 'R-003',
    type: 'Radar',
    status: 'Error',
    location: 'Main Entry',
    lastUpdated: '18 Mar 2025, 13:55',
    position: { x: 20, y: 50 },
    coverageRadius: 15,
  },
  {
    id: 'L-001',
    type: 'Lidar',
    status: 'Active',
    location: 'Server Room',
    lastUpdated: '18 Mar 2025, 14:31',
    position: { x: 70, y: 35 },
    coverageRadius: 12,
  },
  {
    id: 'L-002',
    type: 'Lidar',
    status: 'Active',
    location: 'East Fence',
    lastUpdated: '18 Mar 2025, 14:28',
    position: { x: 80, y: 50 },
    coverageRadius: 12,
  },
  {
    id: 'L-003',
    type: 'Lidar',
    status: 'Offline',
    location: 'West Wall',
    lastUpdated: '18 Mar 2025, 11:10',
    position: { x: 30, y: 70 },
    coverageRadius: 12,
  },
];

export const threats: Threat[] = [
  {
    id: 'TH-001',
    threat: 'Drone',
    sensorId: 'R-001',
    sensorType: 'Radar',
    location: 'North Gate',
    severity: 'High',
    time: '24 Mar 2026, 09:15',
  },
  {
    id: 'TH-002',
    threat: 'Trespassing',
    sensorId: 'L-002',
    sensorType: 'Lidar',
    location: 'East Fence',
    severity: 'Medium',
    time: '23 Mar 2026, 22:40',
  },
  {
    id: 'TH-003',
    threat: 'Weapon',
    sensorId: 'R-003',
    sensorType: 'Radar',
    location: 'Main Entry',
    severity: 'High',
    time: '23 Mar 2026, 17:05',
  },
  {
    id: 'TH-004',
    threat: 'Temperature',
    sensorId: 'L-001',
    sensorType: 'Lidar',
    location: 'Server Room',
    severity: 'Low',
    time: '23 Mar 2026, 11:30',
  },
  {
    id: 'TH-005',
    threat: 'Drone',
    sensorId: 'R-002',
    sensorType: 'Radar',
    location: 'South Perimeter',
    severity: 'High',
    time: '22 Mar 2026, 23:50',
  },
  {
    id: 'TH-006',
    threat: 'Trespassing',
    sensorId: 'L-003',
    sensorType: 'Lidar',
    location: 'West Wall',
    severity: 'Medium',
    time: '22 Mar 2026, 16:20',
  },
  {
    id: 'TH-007',
    threat: 'Drone',
    sensorId: 'R-001',
    sensorType: 'Radar',
    location: 'North Gate',
    severity: 'High',
    time: '22 Mar 2026, 08:45',
  },
  {
    id: 'TH-008',
    threat: 'Weapon',
    sensorId: 'R-002',
    sensorType: 'Radar',
    location: 'South Perimeter',
    severity: 'High',
    time: '21 Mar 2026, 21:10',
  },
  {
    id: 'TH-009',
    threat: 'Trespassing',
    sensorId: 'L-001',
    sensorType: 'Lidar',
    location: 'Server Room',
    severity: 'Low',
    time: '21 Mar 2026, 14:35',
  },
  {
    id: 'TH-010',
    threat: 'Temperature',
    sensorId: 'L-002',
    sensorType: 'Lidar',
    location: 'East Fence',
    severity: 'Medium',
    time: '21 Mar 2026, 07:00',
  },
  {
    id: 'TH-011',
    threat: 'Drone',
    sensorId: 'R-003',
    sensorType: 'Radar',
    location: 'Main Entry',
    severity: 'High',
    time: '20 Mar 2026, 20:25',
  },
  {
    id: 'TH-012',
    threat: 'Trespassing',
    sensorId: 'L-003',
    sensorType: 'Lidar',
    location: 'West Wall',
    severity: 'Low',
    time: '20 Mar 2026, 13:50',
  },
  {
    id: 'TH-013',
    threat: 'Weapon',
    sensorId: 'R-001',
    sensorType: 'Radar',
    location: 'North Gate',
    severity: 'High',
    time: '20 Mar 2026, 06:15',
  },
  {
    id: 'TH-014',
    threat: 'Temperature',
    sensorId: 'L-001',
    sensorType: 'Lidar',
    location: 'Server Room',
    severity: 'Medium',
    time: '19 Mar 2026, 19:40',
  },
  {
    id: 'TH-015',
    threat: 'Drone',
    sensorId: 'R-002',
    sensorType: 'Radar',
    location: 'South Perimeter',
    severity: 'High',
    time: '19 Mar 2026, 12:05',
  },
  {
    id: 'TH-016',
    threat: 'Trespassing',
    sensorId: 'L-002',
    sensorType: 'Lidar',
    location: 'East Fence',
    severity: 'Low',
    time: '19 Mar 2026, 04:30',
  },
  {
    id: 'TH-017',
    threat: 'Weapon',
    sensorId: 'R-003',
    sensorType: 'Radar',
    location: 'Main Entry',
    severity: 'High',
    time: '18 Mar 2026, 22:55',
  },
  {
    id: 'TH-018',
    threat: 'Drone',
    sensorId: 'R-001',
    sensorType: 'Radar',
    location: 'North Gate',
    severity: 'Medium',
    time: '18 Mar 2026, 15:20',
  },
  {
    id: 'TH-019',
    threat: 'Temperature',
    sensorId: 'L-003',
    sensorType: 'Lidar',
    location: 'West Wall',
    severity: 'Low',
    time: '18 Mar 2026, 08:45',
  },
  {
    id: 'TH-020',
    threat: 'Trespassing',
    sensorId: 'R-002',
    sensorType: 'Radar',
    location: 'South Perimeter',
    severity: 'Medium',
    time: '17 Mar 2026, 23:10',
  },
  {
    id: 'TH-021',
    threat: 'Drone',
    sensorId: 'L-001',
    sensorType: 'Lidar',
    location: 'Server Room',
    severity: 'High',
    time: '17 Mar 2026, 16:35',
  },
  {
    id: 'TH-022',
    threat: 'Weapon',
    sensorId: 'R-001',
    sensorType: 'Radar',
    location: 'North Gate',
    severity: 'High',
    time: '17 Mar 2026, 09:00',
  },
  {
    id: 'TH-023',
    threat: 'Trespassing',
    sensorId: 'L-002',
    sensorType: 'Lidar',
    location: 'East Fence',
    severity: 'Medium',
    time: '16 Mar 2026, 21:25',
  },
  {
    id: 'TH-024',
    threat: 'Temperature',
    sensorId: 'R-003',
    sensorType: 'Radar',
    location: 'Main Entry',
    severity: 'Low',
    time: '16 Mar 2026, 13:50',
  },
  {
    id: 'TH-025',
    threat: 'Drone',
    sensorId: 'L-003',
    sensorType: 'Lidar',
    location: 'West Wall',
    severity: 'High',
    time: '15 Mar 2026, 06:15',
  },
];

// Chart data
export const threatsOverTime = [
  { time: '08:00', count: 2 },
  { time: '09:00', count: 5 },
  { time: '10:00', count: 3 },
  { time: '11:00', count: 7 },
  { time: '12:00', count: 4 },
  { time: '13:00', count: 9 },
  { time: '14:00', count: 12 },
  { time: '15:00', count: 8 },
];

export const threatsByLocation = [
  { location: 'North Gate', count: 12 },
  { location: 'East Fence', count: 8 },
  { location: 'Main Entry', count: 7 },
  { location: 'Server Room', count: 5 },
  { location: 'South Perimeter', count: 9 },
  { location: 'West Wall', count: 6 },
];

export const threatTypeDistribution = [
  { name: 'Drone', value: 18, color: '#FF3B3B' },
  { name: 'Trespassing', value: 15, color: '#FF9F0A' },
  { name: 'Temperature', value: 8, color: '#FFCC00' },
  { name: 'Weapon', value: 6, color: '#CC0000' },
];

export const sensorActivityHeatmap = [
  { sensor: 'R-001', hours: [0, 2, 1, 3, 2, 4, 5, 3, 7, 6, 8, 9, 10, 12, 11, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  { sensor: 'R-002', hours: [1, 1, 0, 2, 3, 5, 4, 6, 5, 7, 9, 8, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] },
  { sensor: 'R-003', hours: [0, 0, 1, 1, 2, 3, 2, 4, 3, 5, 6, 7, 8, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0] },
  { sensor: 'L-001', hours: [2, 1, 3, 2, 4, 3, 5, 6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] },
  { sensor: 'L-002', hours: [1, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1] },
  { sensor: 'L-003', hours: [0, 1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 5, 4, 3, 2, 1, 0, 1, 0, 0] },
];

// Scrolling alert messages for ticker
export const tickerMessages = [
  { icon: '⚠', text: 'HUMAN DETECTED', color: '#FF9F0A' },
  { icon: '🔴', text: 'DRONE DETECTED', color: '#FF3B3B' },
  { icon: '✅', text: 'ALL CLEAR', color: '#30D158' },
  { icon: '🔴', text: 'WEAPON DETECTED', color: '#FF3B3B' },
  { icon: '🟡', text: 'TEMPERATURE SPIKE', color: '#FFCC00' },
];