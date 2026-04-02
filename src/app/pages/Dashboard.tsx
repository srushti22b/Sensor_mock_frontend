import { ThreatMap } from '../components/ThreatMap';
import { LiveAlerts } from '../components/LiveAlerts';

export function Dashboard() {
  return (
    <div className="h-full flex gap-4 p-6" style={{ overflow: 'hidden' }}>
      {/* Map Area - 75% */}
      <div className="flex-[0_0_75%]" style={{ height: 'calc(100vh - 4rem)' }}>
        <ThreatMap />
      </div>

      {/* Live Alerts Panel - 25%, Sticky with scrollable threats */}
      <div className="flex-[0_0_25%] flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
        <LiveAlerts />
      </div>
    </div>
  );
}