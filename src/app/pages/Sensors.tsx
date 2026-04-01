import { useState } from "react";
import { SensorOut } from "../types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ChevronDown, MoreVertical, Plus, RotateCcw } from "lucide-react";
import { NotificationBell } from "../components/NotificationBell";
import { useSensors } from "../context/SensorContext";
import { useWebSocket } from "../context/WebSocketContext";

export function Sensors() {
  const { sensorList, updateSensor, addSensor, fetchSensors, loading, error } = useSensors();
  const { liveThreats: threats } = useWebSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<SensorOut | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    type: "Radar" as "Radar" | "Lidar",
    location: "",
    status: "Active" as "Active" | "Offline" | "Error",
  });

  const stats = {
    total: sensorList.length,
    active: sensorList.filter((s) => s.status === "Active").length,
    offline: sensorList.filter((s) => s.status === "Offline").length,
    error: sensorList.filter((s) => s.status === "Error").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "#16A34A";
      case "Error":
        return "#DC2626";
      case "Offline":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const openAddModal = () => {
    setFormData({
      id: "",
      type: "Radar",
      location: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sensor: SensorOut) => {
    setEditingSensor(sensor);
    setFormData({
      id: sensor.id,
      type: sensor.type,
      location: sensor.location,
      status: sensor.status,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = async () => {
    try {
      setIsSubmitting(true);
      const newSensor: Omit<SensorOut, 'id'> = {
        type: formData.type,
        status: formData.status,
        location: formData.location,
        lastUpdated: new Date().toLocaleString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        position: { x: 50, y: 50 },
        coverageRadius: formData.type === "Radar" ? 15 : 12,
      };
      await addSensor(newSensor);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to add sensor:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editingSensor) {
      try {
        setIsSubmitting(true);
        await updateSensor(editingSensor.id, {
          location: formData.location,
          status: formData.status,
        });
        setIsEditModalOpen(false);
        setEditingSensor(null);
      } catch (err) {
        console.error('Failed to update sensor:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification Bell */}
      <NotificationBell liveThreats={threats} />

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
            onClick={() => fetchSensors()}
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
              Loading sensors...
            </p>
          </div>
        </div>
      )}

      {/* Page Header with Add Sensor Button */}
      <div className="flex items-start justify-between">
        <div>
          <div
            className="mb-2"
            style={{
              fontSize: "0.865rem",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Dashboard / Sensors
          </div>
          <h1
            className="font-heading"
            style={{
              fontSize: "2.3rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            SENSORS
          </h1>
        </div>

        {/* Add Sensor Button */}
        <div style={{ marginTop: '40px' }}>
          <button
            onClick={openAddModal}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50"
            style={{
              background: '#0284C7',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              border: 'none',
              letterSpacing: '0.025em',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#0369A1';
                e.currentTarget.style.transform = 'scale(1.02)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#0284C7';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Plus size={16} />
            Add Sensor
          </button>
        </div>
      </div>

      {!loading && !error && (
        <>
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Total Sensors",
            value: stats.total,
            color: "#0284C7",
          },
          {
            label: "Active",
            value: stats.active,
            color: "#16A34A",
          },
          {
            label: "Offline",
            value: stats.offline,
            color: "#6B7280",
          },
          {
            label: "Error",
            value: stats.error,
            color: "#DC2626",
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

      {/* Sensor Table */}
      <div>
        <div
          className="rounded-lg overflow-hidden"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: "var(--bg-table-header)",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  {[
                    "Sensor ID",
                    "Type",
                    "Status",
                    "Location",
                    "Last Updated",
                    "",
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
                {sensorList.map((sensor, index) => (
                  <tr
                    key={sensor.id}
                    className="border-b transition-all duration-200 group relative"
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
                      {sensor.id}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        fontSize: "1.00625rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {sensor.type}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{
                          background: `${getStatusColor(sensor.status)}20`,
                          color: getStatusColor(sensor.status),
                          fontSize: "0.865rem",
                          fontWeight: 600,
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: getStatusColor(sensor.status),
                          }}
                        />
                        {sensor.status}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        fontSize: "1.00625rem",
                        color: "var(--text-primary)",
                      }}
                    >
                      {sensor.location}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        fontSize: "0.865rem",
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {sensor.lastUpdated}
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === sensor.id ? null : sensor.id)}
                        className="p-2 rounded-full transition-all duration-200"
                        style={{ color: '#94A3B8', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(2,132,199,0.1)'
                          e.currentTarget.style.color = '#0284C7'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = '#94A3B8'
                        }}
                      >
                        ⋮
                      </button>

                      {openMenuId === sensor.id && (
                        <>
                          {/* Backdrop to close on outside click */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          {/* Dropdown */}
                          <div
                            className="absolute right-0 z-20 rounded-lg"
                            style={{
                              background: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              width: '120px',
                              top: '100%',
                            }}
                          >
                            <button
                              onClick={() => {
                                setOpenMenuId(null)
                                openEditModal(sensor)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 transition-colors duration-200"
                              style={{
                                fontSize: '0.875rem',
                                color: '#1E293B',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#F0F9FF'
                                e.currentTarget.style.color = '#0284C7'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = '#1E293B'
                              }}
                            >
                              ✏️ Edit
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Add Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent-cyan)",
            borderRadius: "12px",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-heading"
              style={{
                fontSize: "1.725rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              ADD SENSOR
            </DialogTitle>
            <DialogDescription
              className="font-heading"
              style={{
                fontSize: "0.865rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Add a new sensor to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label
                htmlFor="sensorId"
                style={{ color: "var(--text-secondary)" }}
              >
                Sensor ID
              </Label>
              <Input
                id="sensorId"
                value={formData.id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    id: e.target.value,
                  })
                }
                placeholder="e.g. R-004"
                className="mt-1"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <Label htmlFor="type" style={{ color: "var(--text-secondary)" }}>
                Type
              </Label>
              <div className="relative mt-1">
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "Radar" | "Lidar",
                    })
                  }
                  className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
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

            <div>
              <Label
                htmlFor="location"
                style={{ color: "var(--text-secondary)" }}
              >
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
                placeholder="e.g. East Gate"
                className="mt-1"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            <div>
              <Label
                htmlFor="status"
                style={{ color: "var(--text-secondary)" }}
              >
                Status
              </Label>
              <div className="relative mt-1">
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "Active"
                        | "Offline"
                        | "Error",
                    })
                  }
                  className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                  <option value="Error">Error</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--accent-cyan)" }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded transition-all duration-200 disabled:opacity-50"
                style={{
                  fontSize: "1.00625rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.borderColor = "var(--accent-cyan)";
                    e.currentTarget.style.color = "var(--accent-cyan)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveAdd}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded transition-all duration-200 disabled:opacity-50"
                style={{
                  fontSize: "1.00625rem",
                  fontWeight: 600,
                  background: "var(--accent-cyan)",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = "#0369A1";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent-cyan)";
                }}
              >
                {isSubmitting ? 'SAVING...' : 'SAVE'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="sm:max-w-[425px]"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--accent-cyan)",
            borderRadius: "12px",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="font-heading"
              style={{
                fontSize: "1.725rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              EDIT SENSOR
            </DialogTitle>
            <DialogDescription
              className="font-heading"
              style={{
                fontSize: "0.865rem",
                fontWeight: 600,
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Update the details of an existing sensor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Sensor ID - Disabled */}
            <div>
              <Label style={{ color: "var(--text-secondary)" }}>
                Sensor ID
              </Label>
              <Input
                value={formData.id}
                disabled
                className="mt-1"
                style={{
                  background: "#F1F5F9",
                  border: "1px solid var(--border-color)",
                  color: "#94A3B8",
                  cursor: "not-allowed",
                }}
              />
            </div>

            {/* Type - Disabled */}
            <div>
              <Label style={{ color: "var(--text-secondary)" }}>
                Type
              </Label>
              <div className="relative mt-1">
                <select
                  value={formData.type}
                  disabled
                  className="w-full appearance-none px-3 py-2 pr-10 rounded"
                  style={{
                    background: "#F1F5F9",
                    border: "1px solid var(--border-color)",
                    color: "#94A3B8",
                    cursor: "not-allowed",
                  }}
                >
                  <option value="Radar">Radar</option>
                  <option value="Lidar">Lidar</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#94A3B8" }}
                />
              </div>
            </div>

            {/* Location - Editable */}
            <div>
              <Label
                htmlFor="edit-location"
                style={{ color: "var(--text-secondary)" }}
              >
                Location
              </Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: e.target.value,
                  })
                }
                className="mt-1"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent-cyan)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                }}
              />
            </div>

            {/* Status - Editable */}
            <div>
              <Label
                htmlFor="edit-status"
                style={{ color: "var(--text-secondary)" }}
              >
                Status
              </Label>
              <div className="relative mt-1">
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "Active"
                        | "Offline"
                        | "Error",
                    })
                  }
                  className="w-full appearance-none px-3 py-2 pr-10 rounded cursor-pointer"
                  style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                  <option value="Error">Error</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--accent-cyan)" }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSensor(null);
                }}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded transition-all duration-200 disabled:opacity-50"
                style={{
                  fontSize: "1.00625rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-color)",
                  background: "transparent",
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.borderColor = "var(--accent-cyan)";
                    e.currentTarget.style.color = "var(--accent-cyan)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 rounded transition-all duration-200 disabled:opacity-50"
                style={{
                  fontSize: "1.00625rem",
                  fontWeight: 600,
                  background: "var(--accent-cyan)",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.background = "#0369A1";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent-cyan)";
                }}
              >
                {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}