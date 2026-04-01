import { useState, useEffect } from "react";
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { ChevronDown, ChevronLeft, ChevronRight, RotateCcw, Calendar, Clock } from "lucide-react";
import { useWebSocket } from '../context/WebSocketContext'
import { NotificationBell } from "../components/NotificationBell";
import { useSensors } from "../context/SensorContext";
import { apiGet, APIError } from '../services/apiClient';
import { ThreatLog, ThreatSummaryOut } from '../types/api';

export function Threats() {
  const { sensorList, loading: sensorsLoading } = useSensors();
  const { liveThreats } = useWebSocket()
  const [initialThreats, setInitialThreats] = useState<ThreatLog[]>([]);
  const [threatSummary, setThreatSummary] = useState<ThreatSummaryOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterTime, setFilterTime] = useState("All");
  const [filterSensorType, setFilterSensorType] = useState("All");
  const [filterSensorId, setFilterSensorId] = useState("All");
  const [filterThreatType, setFilterThreatType] = useState("All");
  const [filterSeverity, setFilterSeverity] = useState("All");
  
  // Custom date range state
  const [fromDateTime, setFromDateTime] = useState<Date | null>(null)
  const [toDateTime, setToDateTime] = useState<Date | null>(null)
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  // Fetch initial threats and summary from API
  useEffect(() => {
    const fetchThreats = async () => {
      try {
        setLoading(true);
        setError(null);
        const [threats, summary] = await Promise.all([
          apiGet<ThreatLog[]>('/api/v1/threats'),
          apiGet<ThreatSummaryOut>('/api/v1/threats/summary'),
        ]);
        setInitialThreats(threats);
        setThreatSummary(summary);
      } catch (err) {
        const message = err instanceof APIError ? err.message : 'Failed to fetch threats';
        setError(message);
        console.error('[Threats] Error fetching:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchThreats();
  }, []);

  // Merge initial threats with live threats, deduplicating by id
  const allThreats = Array.from(
    new Map([...initialThreats, ...liveThreats].map(t => [t.id, t])).values()
  );

  const stats = {
    total: threatSummary?.total ?? allThreats.length,
    high: threatSummary?.high ?? allThreats.filter((t) => t.severity === "High").length,
    active: threatSummary?.activeSensors ?? 6,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "#DC2626";
      case "Medium":
        return "#D97706";
      case "Low":
        return "#16A34A";
      default:
        return "#6B7280";
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "#FEE2E2";
      case "Medium":
        return "#FEF3C7";
      case "Low":
        return "#DCFCE7";
      default:
        return "#F3F4F6";
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setFilterTime(value);
  };

  const resetFilters = () => {
    setFilterTime("All");
    setFilterSensorType("All");
    setFilterSensorId("All");
    setFilterThreatType("All");
    setFilterSeverity("All");
    setFromDateTime(null)
    setToDateTime(null)
  };

  // Filter threats based on all criteria
  const filteredThreats = allThreats.filter((threat) => {
    // Sensor Type filter
    if (filterSensorType !== "All" && threat.sensorType !== filterSensorType) {
      return false;
    }

    // Sensor ID filter
    if (filterSensorId !== "All" && threat.sensorId !== filterSensorId) {
      return false;
    }

    // Threat Type filter
    if (filterThreatType !== "All" && threat.threat !== filterThreatType) {
      return false;
    }

    // Severity filter
    if (filterSeverity !== "All" && threat.severity !== filterSeverity) {
      return false;
    }

    // Time filter
    if (filterTime !== "All") {
      const parseTime = (timeStr: string): Date => {
        return new Date(timeStr.replace(',', ''))
      }
      const threatTime = parseTime(threat.time)
      const now = new Date()

      if (filterTime === "Last 30 min") {
        if (threatTime < new Date(now.getTime() - 30 * 60 * 1000)) return false
      } else if (filterTime === "Last 1 Hour") {
        if (threatTime < new Date(now.getTime() - 60 * 60 * 1000)) return false
      } else if (filterTime === "Last 2 Hours") {
        if (threatTime < new Date(now.getTime() - 2 * 60 * 60 * 1000)) return false
      } else if (filterTime === 'Custom' && fromDateTime && toDateTime) {
        const threatTime = new Date(new Date(threat.time.replace(',', '')).toLocaleString('en-US', { timeZone: timezone }))
        const from = new Date(fromDateTime.toLocaleString('en-US', { timeZone: timezone }))
        const to = new Date(toDateTime.toLocaleString('en-US', { timeZone: timezone }))
        if (threatTime < from || threatTime > to) return false
      }
    }

    return true;
  });

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
      <NotificationBell liveThreats={allThreats} />

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
              Loading threats...
            </p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <div
          className="mb-2"
          style={{
            fontSize: "0.865rem",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Dashboard / Threats
        </div>
        <h1
          className="font-heading"
          style={{
            fontSize: "2.3rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          THREATS
        </h1>
      </div>

      {!loading && !error && (
        <>
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Threats",
            value: stats.total,
            color: "#0284C7",
          },
          {
            label: "High Priority",
            value: stats.high,
            color: "#DC2626",
          },
          {
            label: "Active",
            value: stats.active,
            color: "#D97706",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-4 border-t-2 transition-all duration-200"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderTopColor: stat.color,
              borderTopWidth: "3px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = `0 4px 20px ${stat.color}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)";
            }}
          >
            <div
              className="font-heading mb-1"
              style={{
                fontSize: "2.59375rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "0.71875rem",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div>
        <div
          className="rounded-lg p-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div className="flex flex-wrap items-end gap-4">
            {/* Time Range */}
            <div className="flex-1 min-w-[150px]">
              <label
                className="block mb-2"
                style={{
                  fontSize: "0.71875rem",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                Time Range
              </label>
              <div className="relative">
                <select
                  value={filterTime}
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer transition-all duration-200"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "1.00625rem",
                  }}
                >
                  <option value="All">All</option>
                  <option value="Last 30 min">Last 30 min</option>
                  <option value="Last 1 Hour">Last 1 Hour</option>
                  <option value="Last 2 Hours">Last 2 Hours</option>
                  <option value="Custom">Custom</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--accent-cyan)" }}
                />
              </div>
            </div>

            {/* Sensor Type */}
            <div className="flex-1 min-w-[150px]">
              <label
                className="block mb-2"
                style={{
                  fontSize: "0.71875rem",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
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
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "1.00625rem",
                  }}
                >
                  <option value="All">All</option>
                  <option value="Radar">Radar</option>
                  <option value="Lidar">Lidar</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--accent-cyan)" }}
                />
              </div>
            </div>

            {/* Sensor ID */}
            <div className="flex-1 min-w-[150px]">
              <label
                className="block mb-2"
                style={{
                  fontSize: "0.71875rem",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                Sensor ID
              </label>
              <div className="relative">
                <select
                  value={filterSensorId}
                  onChange={(e) => setFilterSensorId(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer transition-all duration-200"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "1.00625rem",
                  }}
                >
                  <option value="All">All</option>
                  {sensorList.map((sensor) => (
                    <option key={sensor.id} value={sensor.id}>
                      {sensor.id}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--accent-cyan)" }}
                />
              </div>
            </div>

            {/* Threat Type */}
            <div className="flex-1 min-w-[150px]">
              <label
                className="block mb-2"
                style={{
                  fontSize: "0.71875rem",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
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
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "1.00625rem",
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
                  style={{ color: "var(--accent-cyan)" }}
                />
              </div>
            </div>

            {/* Severity */}
            <div className="flex-1 min-w-[150px]">
              <label
                className="block mb-2"
                style={{
                  fontSize: "0.71875rem",
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
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
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                    color: "var(--text-primary)",
                    fontSize: "1.00625rem",
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
                  style={{ color: "var(--accent-cyan)" }}
                />
              </div>
            </div>

            {/* Reset Button */}
            <div>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200"
                style={{
                  background: "transparent",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  color: "#64748B",
                  fontSize: "1.00625rem",
                  fontWeight: 600,
                  height: "42px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0284C7";
                  e.currentTarget.style.color = "#0284C7";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.color = "#64748B";
                }}
              >
                <RotateCcw size={16} />
                RESET
              </button>
            </div>
          </div>

          {/* Custom Date Picker */}
          {filterTime === "Custom" && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex flex-wrap items-end gap-4">
                {/* FROM Date/Time */}
                <div className="flex-1 min-w-[200px]">
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: "0.71875rem",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 600,
                    }}
                  >
                    FROM
                  </label>
                  <DatePicker
                    selected={fromDateTime}
                    onChange={(date: Date | null) => {
                      setFromDateTime(date);
                      if (toDateTime && date && toDateTime < date) setToDateTime(null);
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
                      fontSize: "0.71875rem",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
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

                {/* Timezone */}
                <div className="flex-1 min-w-[150px]">
                  <label
                    className="block mb-2"
                    style={{
                      fontSize: "0.71875rem",
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-mono)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 600,
                    }}
                  >
                    TIMEZONE
                  </label>
                  <div className="relative">
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer transition-all duration-200"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #E2E8F0",
                        borderRadius: "6px",
                        color: "var(--text-primary)",
                        fontSize: "1.00625rem",
                      }}
                    >
                      {Intl.supportedValuesOf('timeZone').map((tz) => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "var(--accent-cyan)" }}
                    />
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => {}}
                  disabled={!fromDateTime || !toDateTime}
                  className="px-6 py-2.5 rounded transition-all duration-200"
                  style={{
                    background: !fromDateTime || !toDateTime ? "#CBD5E1" : "#0284C7",
                    color: "#FFFFFF",
                    fontSize: "1.00625rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: !fromDateTime || !toDateTime ? "not-allowed" : "pointer",
                    opacity: !fromDateTime || !toDateTime ? 0.6 : 1,
                    padding: "10px 24px",
                  }}
                  onMouseEnter={(e) => {
                    if (!(!fromDateTime || !toDateTime)) {
                      e.currentTarget.style.background = "#0369A1";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = !fromDateTime || !toDateTime ? "#CBD5E1" : "#0284C7";
                  }}
                >
                  APPLY
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Threat Log */}
      <div>
        <h2
          className="mb-4 font-heading"
          style={{
            fontSize: "1.44375rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          THREAT LOG
        </h2>
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <div 
            className="overflow-auto"
            style={{
              maxHeight: "calc(100vh - 420px)",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#CBD5E1 #F1F5F9",
            }}
          >
            <style>
              {`
                .threat-table-container::-webkit-scrollbar {
                  width: 8px;
                }
                .threat-table-container::-webkit-scrollbar-track {
                  background: #F1F5F9;
                }
                .threat-table-container::-webkit-scrollbar-thumb {
                  background: #CBD5E1;
                  border-radius: 4px;
                }
                .threat-table-container::-webkit-scrollbar-thumb:hover {
                  background: #94A3B8;
                }
              `}
            </style>
            <div className="threat-table-container">
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      background: "var(--bg-table-header)",
                      borderBottom: "1px solid var(--border-color)",
                    }}
                  >
                    {[
                      "Threat ID",
                      "Threat",
                      "Sensor ID",
                      "Sensor Type",
                      "Location",
                      "Severity",
                      "Time",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left uppercase tracking-wider"
                        style={{
                          fontSize: "0.865rem",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredThreats.map((threat, index) => (
                    <tr
                      key={threat.id}
                      className="border-b transition-all duration-200"
                      style={{
                        background:
                          index % 2 === 0
                            ? "var(--bg-card)"
                            : "var(--bg-table-alt)",
                        borderColor: "var(--border-color)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--bg-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          index % 2 === 0
                            ? "var(--bg-card)"
                            : "var(--bg-table-alt)";
                      }}
                    >
                      <td
                        className="px-4 py-3"
                        style={{
                          fontSize: "1.00625rem",
                          color: "var(--accent-cyan)",
                          fontFamily: "var(--font-mono)",
                          fontWeight: 600,
                        }}
                      >
                        {threat.id}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          fontSize: "1.00625rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        {threat.threat}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          fontSize: "1.00625rem",
                          color: "var(--text-primary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {threat.sensorId}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          fontSize: "1.00625rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        {threat.sensorType}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          fontSize: "1.00625rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        {threat.location}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                          style={{
                            background: getSeverityBgColor(threat.severity),
                            color: getSeverityColor(threat.severity),
                            fontSize: "0.865rem",
                            fontWeight: 600,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: getSeverityColor(threat.severity),
                            }}
                          />
                          {threat.severity}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{
                          fontSize: "0.865rem",
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {threat.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
    </>
  );
}