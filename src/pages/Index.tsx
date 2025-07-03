
import React, { useState, useEffect } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import { CalendarGrid } from '@/components/CalendarGrid';
import { EventForm } from '@/components/EventForm';
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Plus, Database, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveEvents, loadEvents, clearEvents } from '@/utils/storage';
import { clearMomNotes } from '@/utils/momNotesDb';
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarFilter, setCalendarFilter] = useState<'all' | 'withEvents'>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const { toast } = useToast();

  const navigate = useNavigate();
  // Handler for "Track Minutes of Meeting"
  const handleTrackMom = () => {
    navigate("/mom");
  };

  // Load events from localStorage on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      const loadedEvents = await loadEvents();
      setEvents(loadedEvents);
    };
    fetchEvents();
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    const persistEvents = async () => {
      if (events.length > 0) {
        await saveEvents(events);
      }
    };
    persistEvents();
  }, [events]);

  // Current week dates for initial view
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const handleAddEvent = async (eventData: Omit<DailyEvent, 'id'>) => {
    const newEvent: DailyEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => {
      const updated = [...prev, newEvent];
      return updated;
    });
    // Save after state update
    await saveEvents([...events, newEvent]);
    setShowEventForm(false);
    toast({
      title: "Event Added",
      description: `${eventData.title} has been added to your schedule.`,
    });
  };

  const handleUpdateEvent = async (updatedEvent: DailyEvent) => {
    setEvents(prev => {
      const updated = prev.map(event =>
        event.id === updatedEvent.id ? updatedEvent : event
      );
      return updated;
    });
    await saveEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
    toast({
      title: "Event Updated",
      description: `${updatedEvent.title} has been updated.`,
    });
  };

  const handleRescheduleEvent = async (eventId: string, newDate: Date, newStartTime: string, newEndTime: string) => {
    setEvents(prev => {
      const updated = prev.map(event => {
        if (event.id === eventId) {
          const rescheduledEvent = {
            ...event,
            date: newDate,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'scheduled' as const,
            originalEventId: event.originalEventId || event.id,
          };
          return rescheduledEvent;
        }
        return event;
      });
      return updated;
    });
    await saveEvents(events.map(event =>
      event.id === eventId
        ? { ...event, date: newDate, startTime: newStartTime, endTime: newEndTime, status: 'scheduled' as const, originalEventId: event.originalEventId || event.id }
        : event
    ));
    toast({
      title: "Event Rescheduled",
      description: "Event has been moved to the new date and time.",
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    setEvents(prev => {
      const updated = prev.filter(event => event.id !== eventId);
      return updated;
    });
    await saveEvents(events.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "Event has been removed from your schedule.",
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowEventForm(true);
  };

  const handleClearAllData = async () => {
    if (window.confirm('Are you sure you want to delete all events and Minutes of Meeting notes? This cannot be undone.')) {
      setEvents([]);
      await clearEvents();
      await clearMomNotes();
      toast({
        title: "All Data Cleared",
        description: "All events and Minutes of Meeting notes have been deleted from your schedule.",
      });
    }
  };

  // Get event statistics
  const eventStats = {
    today: events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.toDateString() === today.toDateString();
    }).length,
    thisWeek: events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    }).length,
    scheduled: events.filter(e => e.status === 'scheduled').length,
    completed: events.filter(e => e.status === 'completed').length,
  };

  // Dialog state for Local Storage and Quick Stats
  const [showLocalStorage, setShowLocalStorage] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [reminders, setReminders] = useState<{ id: string; title: string; date: string; time: string }[]>(() => {
    const saved = localStorage.getItem("reminders");
    return saved ? JSON.parse(saved) : [];
  });
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderDateTime, setReminderDateTime] = useState("");
  const [reminderError, setReminderError] = useState<string | null>(null);

  // Helper to get current datetime-local string
  function getCurrentDateTimeLocal() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  // Reminder alert state
  const [dueReminder, setDueReminder] = useState<{ id: string; title: string; date: string; time: string } | null>(null);

  // Track alerted reminders to avoid duplicate alerts
  const [alertedReminderIds, setAlertedReminderIds] = useState<string[]>([]);

  // Poll for due reminders every 10 seconds
  React.useEffect(() => {
    if (!reminders.length) return;
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach((r) => {
        const reminderDate = new Date(`${r.date}T${r.time}`);
        const diff = now.getTime() - reminderDate.getTime();
        // Trigger if due within the last minute and not already alerted
        if (
          diff >= 0 &&
          diff < 60000 &&
          !alertedReminderIds.includes(r.id) &&
          !dueReminder
        ) {
          setDueReminder(r);
          setAlertedReminderIds((prev) => [...prev, r.id]);
        }
      });
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [reminders, dueReminder, alertedReminderIds]);

  // Set default date and time when Reminders modal opens
  React.useEffect(() => {
    if (showReminders) {
      setReminderDateTime(getCurrentDateTimeLocal());
    }
  }, [showReminders]);

  return (
    <div className="flex flex-col items-center min-h-[80vh] py-10">
      <div className="w-full max-w-5xl bg-white/90 rounded-2xl shadow-xl p-8 border border-border">
        <CalendarHeader />
        
        <div className="mb-6 flex flex-wrap gap-4">
          <Button
            onClick={() => setShowEventForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
          <Button
            onClick={handleTrackMom}
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-100"
          >
            Track Minutes of Meeting
          </Button>
          <Button
            onClick={() => navigate("/profile")}
            variant="outline"
            className="border-blue-600 text-blue-700 hover:bg-blue-100"
          >
            My Profile
          </Button>
          <div className="relative">
            <Button
              onClick={() => setShowFilterMenu((v) => !v)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              {calendarFilter === 'all' ? 'Show: All Days' : 'Show: Days with Events'}
            </Button>
            {showFilterMenu && (
              <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg min-w-[180px]">
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${calendarFilter === 'all' ? 'font-bold' : ''}`}
                  onClick={() => {
                    setCalendarFilter('all');
                    setShowFilterMenu(false);
                  }}
                >
                  All Days
                </button>
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-blue-50 ${calendarFilter === 'withEvents' ? 'font-bold' : ''}`}
                  onClick={() => {
                    setCalendarFilter('withEvents');
                    setShowFilterMenu(false);
                  }}
                >
                  Days with Events Only
                </button>
              </div>
            )}
          </div>
          <Button
            onClick={handleClearAllData}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
          <Button
            onClick={() => setShowLocalStorage(true)}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            Local Storage
          </Button>
          <Button
            onClick={() => setShowQuickStats(true)}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Quick Stats
          </Button>
          <Button
            onClick={() => navigate("/csr-events")}
            variant="outline"
            className="border-blue-600 text-blue-700 hover:bg-blue-100"
          >
            CSR Events
          </Button>
          <Button
            onClick={() => navigate("/attendance")}
            variant="outline"
            className="border-purple-600 text-purple-700 hover:bg-purple-100"
          >
            Attendance
          </Button>
          <Button
            onClick={() => setShowReminders(true)}
            variant="outline"
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            Reminders
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-3">
            <div className="bg-gradient-to-br from-blue-100 via-cyan-50 to-indigo-50 rounded-xl shadow p-4 border border-border">
              <CalendarGrid
                events={events}
                onDateSelect={handleDateSelect}
                onDeleteEvent={handleDeleteEvent}
                onUpdateEvent={handleUpdateEvent}
                onRescheduleEvent={handleRescheduleEvent}
                filter={calendarFilter}
              />
            </div>
          </div>
          
          {/* Local Storage and Quick Stats sections moved to dialogs */}
        </div>

        {/* Local Storage Dialog */}
        {showLocalStorage && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowLocalStorage(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">Local Storage</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Your events are automatically saved to your browser's local storage.
              </p>
              <div className="text-xs text-gray-500">
                Total Events: <span className="font-medium">{events.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Dialog */}
        {showQuickStats && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowQuickStats(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Today's Events:</span>
                  <span className="font-medium text-blue-600">{eventStats.today}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Week:</span>
                  <span className="font-medium text-blue-600">{eventStats.thisWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled:</span>
                  <span className="font-medium text-orange-600">{eventStats.scheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-medium text-green-600">{eventStats.completed}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reminders Dialog */}
        {showReminders && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowReminders(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Personal Reminders</h3>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!reminderTitle.trim() || !reminderDateTime) {
                    setReminderError("All fields are required.");
                    return;
                  }
                  const [date, time] = reminderDateTime.split("T");
                  const newReminder = {
                    id: Date.now().toString(),
                    title: reminderTitle,
                    date,
                    time: time || "",
                  };
                  const updated = [...reminders, newReminder];
                  setReminders(updated);
                  localStorage.setItem("reminders", JSON.stringify(updated));
                  setReminderTitle("");
                  setReminderDateTime(getCurrentDateTimeLocal());
                  setReminderError(null);
                }}
                className="mb-4 space-y-2"
              >
                <div>
                  <label htmlFor="reminder-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Name
                  </label>
                  <input
                    id="reminder-title"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Reminder title"
                    value={reminderTitle}
                    onChange={e => setReminderTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="reminder-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    id="reminder-date"
                    type="datetime-local"
                    className="w-full border rounded px-3 py-2"
                    value={reminderDateTime}
                    onChange={e => setReminderDateTime(e.target.value)}
                  />
                </div>
                {reminderError && (
                  <div className="text-xs text-red-500">{reminderError}</div>
                )}
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Add Reminder
                </Button>
              </form>
              <div>
                {reminders.length === 0 ? (
                  <div className="text-gray-500 text-sm">No reminders set.</div>
                ) : (
                  <ul className="space-y-2">
                    {reminders.map(r => (
                      <li key={r.id} className="flex items-center justify-between border-b pb-1">
                        <div>
                          <div className="font-medium">{r.title}</div>
                          <div className="text-xs text-gray-500">
                            {r.date} {r.time}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="text-red-600 px-2 py-1"
                          onClick={() => {
                            const updated = reminders.filter(rem => rem.id !== r.id);
                            setReminders(updated);
                            localStorage.setItem("reminders", JSON.stringify(updated));
                          }}
                        >
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reminder Alert Modal */}
        {dueReminder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
              <h3 className="text-lg font-semibold text-purple-800 mb-4">Reminder Alert</h3>
              <div className="mb-2 font-medium">{dueReminder.title}</div>
              <div className="mb-4 text-xs text-gray-500">
                {dueReminder.date} {dueReminder.time}
              </div>
              <div className="flex gap-3">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                  onClick={() => {
                    // Remove the reminder
                    const updated = reminders.filter((r) => r.id !== dueReminder.id);
                    setReminders(updated);
                    localStorage.setItem("reminders", JSON.stringify(updated));
                    setDueReminder(null);
                  }}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Snooze for 5 minutes
                    const snoozeDate = new Date(`${dueReminder.date}T${dueReminder.time}`);
                    snoozeDate.setMinutes(snoozeDate.getMinutes() + 5);
                    const pad = (n: number) => n.toString().padStart(2, "0");
                    const newDate = `${snoozeDate.getFullYear()}-${pad(snoozeDate.getMonth() + 1)}-${pad(snoozeDate.getDate())}`;
                    const newTime = `${pad(snoozeDate.getHours())}:${pad(snoozeDate.getMinutes())}`;
                    const updated = reminders.map((r) =>
                      r.id === dueReminder.id
                        ? { ...r, date: newDate, time: newTime }
                        : r
                    );
                    setReminders(updated);
                    localStorage.setItem("reminders", JSON.stringify(updated));
                    setDueReminder(null);
                  }}
                >
                  Snooze 5 min
                </Button>
              </div>
            </div>
          </div>
        )}

        {showEventForm && (
          <EventForm
            onSubmit={handleAddEvent}
            onClose={() => setShowEventForm(false)}
            selectedDate={selectedDate}
          />
        )}
      </div>
    </div>
  );
}
export default Index;
