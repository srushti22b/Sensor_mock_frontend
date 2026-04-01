/**
 * TypeScript interfaces matching FastAPI backend response schemas
 */

/**
 * Sensor data structure from backend
 */
export interface SensorOut {
  id: string
  type: 'Radar' | 'Lidar'
  status: 'Active' | 'Offline' | 'Error'
  location: string
  lastUpdated: string
  position: { x: number; y: number } // Map coordinates (percentage)
  coverageRadius: number // in percentage
}

/**
 * Threat/violation log entry from backend
 */
export interface ThreatLog {
  id: string
  threat: string // Threat type: Drone, Trespassing, Weapon, Temperature, etc.
  sensorId: string
  sensorType: 'Radar' | 'Lidar'
  location: string
  severity: 'High' | 'Medium' | 'Low'
  time: string // ISO or formatted datetime string
}

/**
 * Summary statistics for threats
 */
export interface ThreatSummaryOut {
  total: number
  high: number
  activeSensors: number
}

/**
 * Summary statistics for sensors
 */
export interface SensorSummaryOut {
  total: number
  active: number
  offline: number
  error: number
}

/**
 * Single data point for threats over time line chart
 */
export interface ThreatTimelineItem {
  time: string
  count: number
}

/**
 * Threats per sensor for analytics
 */
export interface ThreatPerSensor {
  sensorId: string
  count: number
}

/**
 * Severity breakdown for pie chart
 */
export interface SeverityBreakdown {
  severity: 'High' | 'Medium' | 'Low'
  count: number
}

/**
 * User profile information
 */
export interface UserOut {
  id: string
  username: string
  email: string
  role: string
}

/**
 * WebSocket message format from backend
 */
export interface WebSocketMessage {
  type: 'NEW_THREAT' | 'SENSOR_UPDATE' | string
  payload: any
}

/**
 * Specific WebSocket message for new threat detection
 */
export interface NewThreatMessage extends WebSocketMessage {
  type: 'NEW_THREAT'
  payload: ThreatLog
}

/**
 * Specific WebSocket message for sensor status change
 */
export interface SensorUpdateMessage extends WebSocketMessage {
  type: 'SENSOR_UPDATE'
  payload: {
    sensorId: string
    status: 'Active' | 'Offline' | 'Error'
  }
}
