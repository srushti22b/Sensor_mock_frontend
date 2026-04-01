import { useState, useEffect } from 'react';
import { AlertTriangle, User, Flame, Sword } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { ThreatLog } from '../types/api';

interface LiveAlert extends ThreatLog {
  isNew?: boolean;
}

export function LiveAlerts() {
  const { liveThreats } = useWebSocket();
  const [displayAlerts, setDisplayAlerts] = useState<LiveAlert[]>([]);

  // Update display alerts when live threats change
  useEffect(() => {
    if (liveThreats && liveThreats.length > 0) {
      // Take top 10 threats and mark recently added ones as new
      const newAlerts = liveThreats.slice(0, 10).map((threat, index) => ({
        ...threat,
        isNew: index === 0, // Only the first (most recent) one is marked as new
      }));
      setDisplayAlerts(newAlerts);
    }
  }, [liveThreats]);

  const getIcon = (threat: string) => {
    switch (threat) {
      case 'Drone':
        return <AlertTriangle size={20} />;
      case 'Trespassing':
        return <User size={20} />;
      case 'Temperature':
        return <Flame size={20} />;
      case 'Weapon':
        return <Sword size={20} />;
      default:
        return <AlertTriangle size={20} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#DC2626';
      case 'med':
        return '#D97706';
      case 'low':
        return '#16A34A';
      default:
        return '#6B7280';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#FEE2E2';
      case 'med':
        return '#FEF3C7';
      case 'low':
        return '#DCFCE7';
      default:
        return '#F3F4F6';
    }
  };



  return (
    <div
      className="h-full rounded-lg flex flex-col overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <h3
          className="uppercase tracking-wider"
          style={{
            fontSize: '0.865rem',
            fontWeight: 600,
            color: 'var(--accent-cyan)',
            letterSpacing: '0.1em',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Live Alerts
        </h3>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {displayAlerts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              color: 'var(--text-secondary)',
              paddingTop: '20px',
            }}
          >
            Waiting for alerts...
          </div>
        ) : (
          displayAlerts.map((alert, index) => {
          const severityColor = getSeverityColor(alert.severity);
          const severityBgColor = getSeverityBgColor(alert.severity);
          
          return (
            <div
              key={alert.alert_id}
              className={`rounded-lg transition-all duration-500 ${
                alert.isNew ? 'animate-in slide-in-from-right' : ''
              }`}
              style={{
                background: alert.isNew ? '#DBEAFE' : 'var(--bg-primary)',
                borderLeft: `4px solid ${severityColor}`,
                padding: '12px',
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className="mt-1 flex-shrink-0 p-2 rounded"
                  style={{
                    color: severityColor,
                    background: `${severityColor}15`,
                  }}
                >
                  {getIcon(alert.threat_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4
                      className="font-heading uppercase"
                      style={{
                        fontSize: '1.00625rem',
                        fontWeight: 700,
                        color: severityColor,
                        lineHeight: 1.2,
                      }}
                    >
                      {alert.threat_type?.toUpperCase() || 'UNKNOWN'} DETECTED
                    </h4>
                    {alert.isNew && (
                      <span
                        className="px-2 py-0.5 rounded-full text-xs animate-pulse"
                        style={{
                          background: severityBgColor,
                          color: severityColor,
                          fontSize: '0.71875rem',
                          fontWeight: 600,
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>

                  <div
                    className="flex items-center gap-2"
                    style={{
                      fontSize: '0.865rem',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <span style={{ color: 'var(--accent-cyan)' }}>
                      {alert.sensorId}
                    </span>
                    <span>·</span>
                    <span>{alert.location}</span>
                    <span>·</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
          })
        )}
      </div>
    </div>
  );
}