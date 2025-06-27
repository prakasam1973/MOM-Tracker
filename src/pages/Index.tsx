
import React, { useState, useEffect } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import { CalendarGrid } from '@/components/CalendarGrid';
import { EventForm } from '@/components/EventForm';
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Plus, Database, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveEvents, loadEvents, clearEvents } from '@/utils/storage';

const Index = () => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load events from localStorage on component mount
  useEffect(() => {
    const loadedEvents = loadEvents();
    setEvents(loadedEvents);
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    if (events.length > 0) {
      saveEvents(events);
    }
  }, [events]);

  // Current week dates for initial view
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const handleAddEvent = (eventData: Omit<DailyEvent, 'id'>) => {
    const newEvent: DailyEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => {
      const updated = [...prev, newEvent];
      saveEvents(updated);
      return updated;
    });
    setShowEventForm(false);
    toast({
      title: "Event Added",
      description: `${eventData.title} has been added to your schedule.`,
    });
  };

  const handleUpdateEvent = (updatedEvent: DailyEvent) => {
    setEvents(prev => {
      const updated = prev.map(event => 
        event.id === updatedEvent.id ? updatedEvent : event
      );
      saveEvents(updated);
      return updated;
    });
    toast({
      title: "Event Updated",
      description: `${updatedEvent.title} has been updated.`,
    });
  };

  const handleRescheduleEvent = (eventId: string, newDate: Date, newStartTime: string, newEndTime: string) => {
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
      saveEvents(updated);
      return updated;
    });
    
    toast({
      title: "Event Rescheduled",
      description: "Event has been moved to the new date and time.",
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => {
      const updated = prev.filter(event => event.id !== eventId);
      saveEvents(updated);
      return updated;
    });
    toast({
      title: "Event Deleted",
      description: "Event has been removed from your schedule.",
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowEventForm(true);
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete all events? This cannot be undone.')) {
      setEvents([]);
      clearEvents();
      toast({
        title: "All Data Cleared",
        description: "All events have been deleted from your schedule.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-6">
        <CalendarHeader />
        
        <div className="mb-6 flex gap-4">
          <Button 
            onClick={() => setShowEventForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
          <Button 
            onClick={handleClearAllData}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarGrid
              events={events}
              onDateSelect={handleDateSelect}
              onDeleteEvent={handleDeleteEvent}
              onUpdateEvent={handleUpdateEvent}
              onRescheduleEvent={handleRescheduleEvent}
            />
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
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

            <div className="bg-white rounded-lg shadow-lg p-6">
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

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Events:</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">With Person:</span>
                  <span className="font-medium">{events.filter(e => e.person && e.person.trim() !== '').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">With Location:</span>
                  <span className="font-medium">{events.filter(e => e.location && e.location.trim() !== '').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

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
};

export default Index;
