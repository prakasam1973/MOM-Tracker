
import React, { useState, useEffect } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import MomNotesList from "./MomNotesList";
import DailySteps from "./DailySteps";
import Joke from "./Joke";
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
  // calendarFilter and showFilterMenu removed
  const { toast } = useToast();

  const navigate = useNavigate();
  // Use a single state for active view: "menu", "joke", "todos", "steps", "about"
  const [activeView, setActiveView] = useState<"menu" | "joke" | "todos" | "steps" | "about">("menu");

  // Handler for "Track Minutes of Meeting"
  // Handler functions for navigation
  const handleTrackMom = () => setActiveView("todos");
  const handleTrackSteps = () => setActiveView("steps");
  const handleShowJoke = () => setActiveView("joke");
  const handleShowDashboard = () => setActiveView("menu");

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

  // handleClearAllData removed

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
  // showLocalStorage and showQuickStats removed
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
      <div className="w-full max-w-5xl bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100 rounded-2xl shadow-xl p-0 border border-border">
        {/* Hero Section */}
        <div className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-t-2xl px-8 py-10 flex flex-col items-center text-center relative overflow-hidden">
          <div className="flex items-center justify-center mb-4">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg">
              <span className="text-3xl font-bold text-blue-600 select-none">PS</span>
            </span>
          </div>
          {/* Marquee effect for the new heading */}
          <div className="w-full overflow-hidden h-14 flex items-center mb-2 relative">
            <div className="marquee whitespace-nowrap text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
              Prakasam's Personal Assistant. Trust me he didn't write single line of code to build me!
            </div>
          </div>
          <style>
            {`
              .marquee {
                display: inline-block;
                white-space: nowrap;
                animation: marquee 18s linear infinite;
              }
              @keyframes marquee {
                0%   { transform: translateX(100%); }
                100% { transform: translateX(-100%); }
              }
            `}
          </style>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-4">Your all-in-one dashboard for managing travel, meetings, todos, and more. Stay organized and productive with a beautiful, easy-to-use interface.</p>
        </div>

        {/* Menu Section */}
        {/* Main Content: Show menu or todo list */}
        {activeView === "joke" && (
          <div className="px-8 py-8">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleShowDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
            </div>
            <Joke />
          </div>
        )}
        {activeView === "todos" && (
          <div className="px-8 py-8">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleShowDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
            </div>
            <MomNotesList />
          </div>
        )}
        {activeView === "steps" && (
          <div className="px-8 py-8">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleShowDashboard}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
            </div>
            <DailySteps />
          </div>
        )}
        {activeView === "menu" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-8 py-8">
            <button
              onClick={handleTrackMom}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-green-200 to-green-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-green-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12l2 2l4-4" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-green-900">Track Minutes of Meeting</span>
              <span className="text-sm text-green-700 mt-1">View and manage your todo/action items</span>
            </button>
            <button
              onClick={handleTrackSteps}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-cyan-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-blue-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 17v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-cyan-900">Track My Daily Steps</span>
              <span className="text-sm text-cyan-700 mt-1">Log and view your daily step count</span>
            </button>
            {/* Stock Market menu removed */}
            <button
              onClick={() => navigate("/profile")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-blue-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-blue-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-blue-900">My Profile</span>
              <span className="text-sm text-blue-700 mt-1">View and edit your profile</span>
            </button>
            {/* Clear All Data button removed */}
            {/* Local Storage and Quick Stats buttons removed */}
            <button
              onClick={() => navigate("/csr-events")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-cyan-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-blue-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 20v-6M6 20v-4M18 20v-2" />
                  <circle cx="12" cy="10" r="4" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-cyan-900">CSR Events</span>
              <span className="text-sm text-cyan-700 mt-1">Corporate Social Responsibility</span>
            </button>
            <button
              onClick={() => navigate("/attendance")}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-200 to-purple-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-purple-300 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M8 17v-1a4 4 0 0 1 8 0v1" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-purple-900">Attendance</span>
              <span className="text-sm text-purple-700 mt-1">Track your attendance</span>
            </button>
            <button
              onClick={() => setShowReminders(true)}
              className="flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-purple-200 focus:outline-none"
            >
              <span className="mb-2">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </span>
              <span className="font-semibold text-lg text-pink-900">Reminders</span>
              <span className="text-sm text-pink-700 mt-1">Set personal reminders</span>
            </button>
              <button
                onClick={() => setActiveView("about")}
                className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl shadow hover:scale-105 transition p-6 border-2 border-gray-300 focus:outline-none"
              >
                <span className="mb-2">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                </span>
                <span className="font-semibold text-lg text-gray-900">About App</span>
                <span className="text-sm text-gray-700 mt-1">Version & Tech Stack</span>
              </button>
          </div>
        )}

        {/* Duplicate MomNotesList rendering removed */}

        {/* Local Storage and Quick Stats dialogs removed */}

        {/* Reminders Dialog */}
        {showReminders && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-50">
            <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              {/* Gradient header bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 to-pink-500">
                <h3 className="text-lg font-semibold text-white drop-shadow">Personal Reminders</h3>
                <button
                  className="text-white text-2xl font-bold hover:text-pink-200 transition"
                  onClick={() => setShowReminders(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="px-6 py-6 bg-white/90 rounded-b-2xl">
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
                    <label htmlFor="reminder-title" className="block text-sm font-medium text-purple-800 mb-1">
                      Reminder Name
                    </label>
                    <input
                      id="reminder-title"
                      className="w-full border rounded px-3 py-2 bg-purple-50/50"
                      placeholder="Reminder title"
                      value={reminderTitle}
                      onChange={e => setReminderTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="reminder-date" className="block text-sm font-medium text-purple-800 mb-1">
                      Date
                    </label>
                    <input
                      id="reminder-date"
                      type="datetime-local"
                      className="w-full border rounded px-3 py-2 bg-pink-50/50"
                      value={reminderDateTime}
                      onChange={e => setReminderDateTime(e.target.value)}
                    />
                  </div>
                  {reminderError && (
                    <div className="text-xs text-red-500">{reminderError}</div>
                  )}
                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-500 hover:to-purple-600 text-white shadow-md">
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

        {/* EventForm modal removed */}

        {/* About App Dialog */}
        {activeView === "about" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-400 to-indigo-400 opacity-90"></div>
              {/* Content card */}
              <div className="relative z-10 p-0">
                {/* Header bar */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-700 to-cyan-500">
                  <h3 className="text-2xl font-bold text-white drop-shadow">About This App</h3>
                  <button
                    className="text-white text-2xl font-bold hover:text-cyan-200 transition"
                    onClick={() => setActiveView("menu")}
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>
                <div className="px-6 py-6 bg-white/90 rounded-b-2xl">
                  <div className="mb-4">
                    <span className="font-semibold text-gray-700">Version:</span>
                    <span className="ml-2 text-blue-700 font-mono">1.0.0</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Tech Stack:</span>
                    <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 text-sm">
                      <li>React (TypeScript)</li>
                      <li>Vite</li>
                      <li>Tailwind CSS</li>
                      <li>shadcn/ui & Radix UI</li>
                      <li>Dexie (IndexedDB)</li>
                      <li>React Hook Form & Zod</li>
                      <li>date-fns, react-day-picker</li>
                      <li>Lucide Icons</li>
                      <li>Recharts</li>
                      <li>PostCSS, ESLint, Prettier</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Index;
