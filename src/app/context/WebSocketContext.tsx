import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { mockWS, WSMessage } from '../services/mockWebSocket'
import { Threat, threats as initialThreats } from '../data/mockData'
import { useSensors } from './SensorContext'

interface WebSocketContextType {
  liveThreats: Threat[]        // All threats including new live ones
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
  liveThreats: initialThreats,
  isConnected: false,
})

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { updateSensor } = useSensors()
  const [liveThreats, setLiveThreats] = useState<Threat[]>(initialThreats)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Start the mock WebSocket
    mockWS.connect()
    setIsConnected(true)

    // Listen for incoming messages
    const unsubscribe = mockWS.onMessage((message: WSMessage) => {
      if (message.type === 'NEW_THREAT') {
        // Prepend new threat to the top of the list
        setLiveThreats((prev) => [message.payload, ...prev])
      }

      if (message.type === 'SENSOR_UPDATE') {
        // Update the sensor status in SensorContext
        updateSensor(message.payload.sensorId, {
          status: message.payload.status,
        })
      }
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      mockWS.disconnect()
      setIsConnected(false)
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ liveThreats, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  return useContext(WebSocketContext)
}