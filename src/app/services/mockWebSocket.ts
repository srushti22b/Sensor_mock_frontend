import { Threat } from '../data/mockData'

// All possible threat types and locations to randomly generate from
const THREAT_TYPES = ['Drone', 'Trespassing', 'Weapon', 'Temperature']
const SENSOR_POOL = [
  { id: 'R-001', type: 'Radar' as const, location: 'North Gate' },
  { id: 'R-002', type: 'Radar' as const, location: 'South Perimeter' },
  { id: 'R-003', type: 'Radar' as const, location: 'Main Entry' },
  { id: 'L-001', type: 'Lidar' as const, location: 'Server Room' },
  { id: 'L-002', type: 'Lidar' as const, location: 'East Fence' },
  { id: 'L-003', type: 'Lidar' as const, location: 'West Wall' },
]
const SEVERITIES = ['High', 'Medium', 'Low'] as const
const STATUS_OPTIONS = ['Active', 'Offline', 'Error'] as const

// Message types — exactly what FastAPI would send over WebSocket
export type WSMessageType =
  | 'NEW_THREAT'        // A new threat was detected
  | 'SENSOR_UPDATE'     // A sensor changed status

export interface NewThreatMessage {
  type: 'NEW_THREAT'
  payload: Threat
}

export interface SensorUpdateMessage {
  type: 'SENSOR_UPDATE'
  payload: {
    sensorId: string
    status: 'Active' | 'Offline' | 'Error'
  }
}

export type WSMessage = NewThreatMessage | SensorUpdateMessage

// Counter to generate unique threat IDs
let threatCounter = 26 // starts after TH-025

function generateThreatId(): string {
  const id = `TH-${String(threatCounter).padStart(3, '0')}`
  threatCounter++
  return id
}

function getCurrentTimestamp(): string {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Generate a fake NEW_THREAT message
function generateThreatMessage(): NewThreatMessage {
  const sensor = randomFrom(SENSOR_POOL)
  return {
    type: 'NEW_THREAT',
    payload: {
      id: generateThreatId(),
      threat: randomFrom(THREAT_TYPES),
      sensorId: sensor.id,
      sensorType: sensor.type,
      location: sensor.location,
      severity: randomFrom(SEVERITIES),
      time: getCurrentTimestamp(),
    },
  }
}

// Generate a fake SENSOR_UPDATE message
function generateSensorUpdateMessage(): SensorUpdateMessage {
  const sensor = randomFrom(SENSOR_POOL)
  return {
    type: 'SENSOR_UPDATE',
    payload: {
      sensorId: sensor.id,
      status: randomFrom(STATUS_OPTIONS),
    },
  }
}

// ─────────────────────────────────────────────
// MockWebSocketService
// This class pretends to be a WebSocket connection
// to your FastAPI backend. It fires events on a
// timer exactly like real sensor data would arrive.
// ─────────────────────────────────────────────
export class MockWebSocketService {
  private listeners: ((message: WSMessage) => void)[] = []
  private threatInterval: ReturnType<typeof setInterval> | null = null
  private sensorInterval: ReturnType<typeof setInterval> | null = null
  private isConnected = false

  // Start the mock — call this once when app loads
  connect() {
    if (this.isConnected) return
    this.isConnected = true

    console.log('[MockWS] Connected — simulating live sensor data')

    // Send a new THREAT every 10 seconds
    this.threatInterval = setInterval(() => {
      const message = generateThreatMessage()
      console.log('[MockWS] NEW_THREAT →', message.payload)
      this.emit(message)
    }, 10000)

    // Send a SENSOR_UPDATE every 20 seconds
    this.sensorInterval = setInterval(() => {
      const message = generateSensorUpdateMessage()
      console.log('[MockWS] SENSOR_UPDATE →', message.payload)
      this.emit(message)
    }, 20000)
  }

  // Stop the mock — call this on cleanup
  disconnect() {
    if (this.threatInterval) clearInterval(this.threatInterval)
    if (this.sensorInterval) clearInterval(this.sensorInterval)
    this.isConnected = false
    console.log('[MockWS] Disconnected')
  }

  // Subscribe to incoming messages
  onMessage(listener: (message: WSMessage) => void) {
    this.listeners.push(listener)
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private emit(message: WSMessage) {
    this.listeners.forEach((listener) => listener(message))
  }
}

// Export a single shared instance — used across the whole app
export const mockWS = new MockWebSocketService()