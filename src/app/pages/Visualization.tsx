import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Download, ChevronDown, RotateCcw } from 'lucide-react';
import { NotificationBell } from '../components/NotificationBell';
import { useWebSocket } from '../context/WebSocketContext';
import { apiGet, APIError } from '../services/apiClient';
import { ThreatTimelineItem, ThreatPerSensor, SeverityBreakdown, ThreatLog } from '../types/api';

export function Visualization() {
  const { liveThreats } = useWebSocket();
  
  // State for fetched analytics data
  const [threatsOverTimeData, setThreatsOverTimeData] = useState<ThreatTimelineItem[]>([]);
  const [threatsByLocationData, setThreatsByLocationData] = useState<any[]>([]);
  const [threatTypeDistributionData, setThreatTypeDistributionData] = useState<any[]>([]);
  const [sensorActivityData, setSensorActivityData] = useState<any[]>([]);
  const [allThreats, setAllThreats] = useState<ThreatLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterTimeRange, setFilterTimeRange] = useState('Last 7 Days');
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterThreatType, setFilterThreatType] = useState('All');
  const [filterSensorType, setFilterSensorType] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [fromDateTime, setFromDateTime] = useState<Date | null>(null);
  const [toDateTime, setToDateTime] = useState<Date | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const [timeline, perSensor, severity, threats] = await Promise.all([
          apiGet<ThreatTimelineItem[]>('/api/v1/analytics/threat-timeline'),
          apiGet<ThreatPerSensor[]>('/api/v1/analytics/threats-per-sensor'),
          apiGet<SeverityBreakdown[]>('/api/v1/analytics/severity-breakdown'),
          apiGet<ThreatLog[]>('/api/v1/threats'),
        ]);
        
        setThreatsOverTimeData(timeline);
        setSensorActivityData(perSensor.map(item => ({ sensor: item.sensorId, count: item.count })));
        
        // Transform severity breakdown for pie chart
        const colorMap: { [key: string]: string } = {
          High: '#FF3B3B',
          Medium: '#FF9F0A',
          Low: '#16A34A',
        };
        setThreatTypeDistributionData(
          severity.map(item => ({
            name: item.severity,
            value: item.count,
            color: colorMap[item.severity] || '#999999',
          }))
        );
        
        setAllThreats(threats);
        
        // Derive threats by location from threats data
        const locationMap: { [key: string]: number } = {};
        threats.forEach((threat) => {
          locationMap[threat.location] = (locationMap[threat.location] || 0) + 1;
        });
        setThreatsByLocationData(
          Object.entries(locationMap)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count)
        );
      } catch (err) {
        const message = err instanceof APIError ? err.message : 'Failed to fetch analytics';
        setError(message);
        console.error('[Visualization] Error fetching:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Helper function to parse threat time
  const parseTime = (timeStr: string): Date => {
    return new Date(timeStr.replace(',', ''));
  };

  // Merge API threats with live threats, removing duplicates by id
  const mergedThreats = Array.from(
    new Map([...allThreats, ...liveThreats].map(t => [t.id, t])).values()
  );

  // Filter threats based on all criteria
  const filteredThreats = mergedThreats.filter((threat) => {
    // Location filter
    if (filterLocation !== 'All' && threat.location !== filterLocation) {
      return false;
    }

    // Threat Type filter
    if (filterThreatType !== 'All' && threat.threat !== filterThreatType) {
      return false;
    }

    // Sensor Type filter
    if (filterSensorType !== 'All' && threat.sensorType !== filterSensorType) {
      return false;
    }

    // Severity filter
    if (filterSeverity !== 'All' && threat.severity !== filterSeverity) {
      return false;
    }

    // Time Range filter
    if (filterTimeRange !== 'All') {
      const threatTime = parseTime(threat.time);
      const now = new Date();

      if (filterTimeRange === 'Last 30 Min') {
        if (threatTime < new Date(now.getTime() - 30 * 60 * 1000)) return false;
      } else if (filterTimeRange === 'Last 1 Hour') {
        if (threatTime < new Date(now.getTime() - 60 * 60 * 1000)) return false;
      } else if (filterTimeRange === 'Last 24 Hours') {
        if (threatTime < new Date(now.getTime() - 24 * 60 * 60 * 1000)) return false;
      } else if (filterTimeRange === 'Last 7 Days') {
        if (threatTime < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)) return false;
      } else if (filterTimeRange === 'Last 30 Days') {
        if (threatTime < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)) return false;
      } else if (filterTimeRange === 'Custom' && fromDateTime && toDateTime) {
        if (threatTime < fromDateTime || threatTime > toDateTime) return false;
      }
    }

    return true;
  });

  // Reset filters
  const resetFilters = () => {
    setFilterTimeRange('Last 7 Days');
    setFilterLocation('All');
    setFilterThreatType('All');
    setFilterSensorType('All');
    setFilterSeverity('All');
    setFromDateTime(null);
    setToDateTime(null);
  };

  return (
    <>
      <style>{`
        .react-datepicker-wrapper input {
          width: 100% !important;
          padding: 8px 12px !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 6px !important;
          font-size: 1.00625rem !important;
          color: var(--text-primary) !important;
          background: #FFFFFF !important;
          font-family: inherit !important;
          transition: all 0.2s duration !important;
          outline: none;
        }
        .react-datepicker-wrapper input:hover {
          border-color: #0284C7 !important;
        }
        .react-datepicker-wrapper input:focus {
          border-color: #0284C7 !important;
          box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.1) !important;
        }
        .react-datepicker {
          font-size: 0.875rem !important;
          border: 1px solid #E2E8F0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }
        .react-datepicker__header {
          background-color: var(--bg-card) !important;
          border-bottom: 1px solid #E2E8F0 !important;
          border-radius: 8px 8px 0 0 !important;
        }
        .react-datepicker__current-month {
          color: var(--text-primary) !important;
          font-weight: 600 !important;
        }
        .react-datepicker__day {
          color: var(--text-primary) !important;
        }
        .react-datepicker__day--selected {
          background-color: #0284C7 !important;
          color: #FFFFFF !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #0284C7 !important;
          color: #FFFFFF !important;
        }
        .react-datepicker__day:hover {
          background-color: #E0F2FE !important;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #0284C7 !important;
          color: #FFFFFF !important;
        }
        .react-datepicker__time-list-item:hover {
          background-color: #E0F2FE !important;
        }
      `}</style>
      <div className="p-6 space-y-6">
        {/* Notification Bell */}
        <NotificationBell liveThreats={liveThreats} />

        {/* Page Header */}
        <div>
          <div
            className="mb-2"
            style={{
              fontSize: '0.865rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Dashboard / Visualization
          </div>
          <h1
            className="font-heading"
            style={{
              fontSize: '2.3rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            VISUALIZATION
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-4 rounded-lg border flex items-center justify-between"
            style={{
              background: '#FEE2E2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
            }}
          >
            <span>⚠️ {error}</span>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-3 py-1 rounded transition-colors"
              style={{
                background: '#991B1B',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              <RotateCcw size={16} />
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
                style={{ borderColor: '#0284C7' }}
              />
              <p style={{ color: 'var(--text-secondary)', marginTop: '1rem', fontSize: '0.875rem' }}>
                Loading analytics...
              </p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
        <div>
          <div
            className="rounded-lg p-4"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <div className="flex flex-wrap items-end gap-4">
              {/* Time Range */}
              <div className="flex-1 min-w-[150px]">
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '0.71875rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  Time Range
                </label>
                <div className="relative">
                  <select
                    value={filterTimeRange}
                    onChange={(e) => setFilterTimeRange(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer transition-all duration-200"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '1.00625rem',
                    }}
                  >
                    <option value="Last 30 Min">Last 30 Min</option>
                    <option value="Last 1 Hour">Last 1 Hour</option>
                    <option value="Last 24 Hours">Last 24 Hours</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Custom">Custom</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--accent-cyan)' }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex-1 min-w-[150px]">
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '0.71875rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  Location
                </label>
                <div className="relative">
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer transition-all duration-200"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '1.00625rem',
                    }}
                  >
                    <option value="All">All</option>
                    <option value="North Gate">North Gate</option>
                    <option value="East Fence">East Fence</option>
                    <option value="Main Entry">Main Entry</option>
                    <option value="Server Room">Server Room</option>
                    <option value="South Perimeter">South Perimeter</option>
                    <option value="West Wall">West Wall</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--accent-cyan)' }}
                  />
                </div>
              </div>

              {/* Threat Type */}
              <div className="flex-1 min-w-[150px]">
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '0.71875rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  Threat Type
                </label>
                <div className="relative">
                  <select
                    value={filterThreatType}
                    onChange={(e) => setFilterThreatType(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer transition-all duration-200"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '1.00625rem',
                    }}
                  >
                    <option value="All">All</option>
                    <option value="Drone">Drone</option>
                    <option value="Trespassing">Trespassing</option>
                    <option value="Weapon">Weapon</option>
                    <option value="Temperature">Temperature</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--accent-cyan)' }}
                  />
                </div>
              </div>

              {/* Sensor Type */}
              <div className="flex-1 min-w-[150px]">
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '0.71875rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  Sensor Type
                </label>
                <div className="relative">
                  <select
                    value={filterSensorType}
                    onChange={(e) => setFilterSensorType(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer transition-all duration-200"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '1.00625rem',
                    }}
                  >
                    <option value="All">All</option>
                    <option value="Radar">Radar</option>
                    <option value="Lidar">Lidar</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--accent-cyan)' }}
                  />
                </div>
              </div>

              {/* Severity */}
              <div className="flex-1 min-w-[150px]">
                <label
                  className="block mb-2"
                  style={{
                    fontSize: '0.71875rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}
                >
                  Severity
                </label>
                <div className="relative">
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer transition-all duration-200"
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '1.00625rem',
                    }}
                  >
                    <option value="All">All</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--accent-cyan)' }}
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div>
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200"
                  style={{
                    background: 'transparent',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    color: '#64748B',
                    fontSize: '1.00625rem',
                    fontWeight: 600,
                    height: '42px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0284C7';
                    e.currentTarget.style.color = '#0284C7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.color = '#64748B';
                  }}
                >
                  <RotateCcw size={16} />
                  RESET
                </button>
              </div>
            </div>

            {/* Custom Date Picker */}
            {filterTimeRange === 'Custom' && (
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: '#E2E8F0' }}
              >
                <div className="flex flex-wrap items-end gap-4">
                  {/* FROM Date/Time */}
                  <div className="flex-1 min-w-[200px]">
                    <label
                      className="block mb-2"
                      style={{
                        fontSize: '0.71875rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                      }}
                    >
                      FROM
                    </label>
                    <DatePicker
                      selected={fromDateTime}
                      onChange={(date: Date | null) => {
                        setFromDateTime(date);
                        if (toDateTime && date && toDateTime < date)
                          setToDateTime(null);
                      }}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={1}
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="DD/MM/YYYY HH:MM"
                      isClearable
                    />
                  </div>

                  {/* TO Date/Time */}
                  <div className="flex-1 min-w-[200px]">
                    <label
                      className="block mb-2"
                      style={{
                        fontSize: '0.71875rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: 600,
                      }}
                    >
                      TO
                    </label>
                    <DatePicker
                      selected={toDateTime}
                      onChange={(date: Date | null) => setToDateTime(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={1}
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="DD/MM/YYYY HH:MM"
                      minDate={fromDateTime || undefined}
                      isClearable
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Chart 1: Threats Over Time */}
          <ChartCard title="Threats Over Time">
            {filteredThreats.length === 0 ? (
              <div className="w-full h-[250px] flex items-center justify-center">
                <div
                  style={{
                    fontSize: '0.865rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  No data available for selected filters
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={threatsOverTimeData}>
                  <defs>
                    <linearGradient
                      id="colorCount"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(226, 232, 240, 0.8)"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="var(--text-secondary)"
                    style={{
                      fontSize: '0.865rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <YAxis
                    stroke="var(--text-secondary)"
                    style={{
                      fontSize: '0.865rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#0284C7"
                    strokeWidth={3}
                    fill="url(#colorCount)"
                    dot={{ fill: '#0284C7', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 2: Threats by Location */}
          <ChartCard title="Threats by Location">
            {filteredThreats.length === 0 ? (
              <div className="w-full h-[250px] flex items-center justify-center">
                <div
                  style={{
                    fontSize: '0.865rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  No data available for selected filters
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={threatsByLocationData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(226, 232, 240, 0.8)"
                  />
                  <XAxis
                    type="number"
                    stroke="var(--text-secondary)"
                    style={{
                      fontSize: '0.865rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="location"
                    stroke="var(--text-secondary)"
                    style={{
                      fontSize: '0.865rem',
                      fontFamily: 'var(--font-mono)',
                    }}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {threatsByLocationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`rgba(2, 132, 199, ${0.4 + entry.count * 0.04})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Chart 3: Threat Type Distribution */}
          <ChartCard title="Threat Type Distribution">
            {filteredThreats.length === 0 ? (
              <div className="w-full h-[250px] flex items-center justify-center">
                <div
                  style={{
                    fontSize: '0.865rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  No data available for selected filters
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={threatTypeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {threatTypeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <Legend
                      wrapperStyle={{
                        fontSize: '0.865rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
                  style={{ marginTop: '-10px' }}
                >
                  <div
                    className="font-heading"
                    style={{
                      fontSize: '1.725rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {filteredThreats.length}
                  </div>
                  <div
                    style={{
                      fontSize: '0.865rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    TOTAL
                  </div>
                </div>
              </>
            )}
          </ChartCard>

          {/* Chart 4: Sensor Activity Heatmap */}
          <ChartCard title="Sensor Activity Heatmap">
            {filteredThreats.length === 0 ? (
              <div className="w-full h-[250px] flex items-center justify-center">
                <div
                  style={{
                    fontSize: '0.865rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  No data available for selected filters
                </div>
              </div>
            ) : (
              <div className="w-full h-[250px] overflow-auto">
                <div className="min-w-[600px]">
                  {(() => {
                    // Derive heatmap data from filtered threats
                    const sensorSet = new Set(mergedThreats.map(t => t.sensorId));
                    const heatmapData = Array.from(sensorSet).map((sensorId) => {
                      const hours = Array(24).fill(0);
                      filteredThreats
                        .filter((threat) => threat.sensorId === sensorId)
                        .forEach((threat) => {
                          const hour = parseTime(threat.time).getHours();
                          hours[hour]++;
                        });
                      return { sensor: sensorId, hours };
                    });
                    return heatmapData;
                  })().map((sensorData: any) => (
                    <div
                      key={sensorData.sensor}
                      className="flex items-center gap-2 mb-1"
                    >
                      <div
                        className="w-16 text-right"
                        style={{
                          fontSize: '0.865rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--accent-cyan)',
                        }}
                      >
                        {sensorData.sensor}
                      </div>
                      <div className="flex gap-1 flex-1">
                        {sensorData.hours.map((activity: number, hourIdx: number) => {
                          const intensity = activity / 12;
                          return (
                            <div
                              key={hourIdx}
                              className="w-5 h-8 rounded transition-all duration-200"
                              style={{
                                background: `rgba(2, 132, 199, ${
                                  intensity * 0.8
                                })`,
                                border:
                                  '1px solid rgba(2, 132, 199, 0.2)',
                              }}
                              title={`${hourIdx}:00 - Activity: ${activity}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-16" />
                    <div className="flex gap-1 flex-1">
                      {Array.from({ length: 24 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-5 text-center"
                          style={{
                            fontSize: '0.71875rem',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {idx % 3 === 0 ? idx : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ChartCard>
        </div>
        </>
        )}
      </div>
    </>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg p-4 border transition-all duration-200 relative"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(2, 132, 199, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
      }}
    >
      <div className="flex items-center justify-between mb-4">
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
          {title}
        </h3>
        <button
          className="p-1 rounded transition-all duration-200"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-cyan)';
            e.currentTarget.style.background = 'rgba(2, 132, 199, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Download size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}