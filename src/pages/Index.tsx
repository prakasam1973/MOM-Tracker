
import React, { useState } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import { CalendarGrid } from '@/components/CalendarGrid';
import { EventForm } from '@/components/EventForm';
import { SlackIntegration } from '@/components/SlackIntegration';
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [events, setEvents] = useState<DailyEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showSlackPanel, setShowSlackPanel] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

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
    setEvents(prev => [...prev, newEvent]);
    setShowEventForm(false);
    toast({
      title: "Event Added",
      description: `${eventData.title} has been added to your schedule.`,
    });
  };

  const handleUpdateEvent = (updatedEvent: DailyEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    toast({
      title: "Event Updated",
      description: `${updatedEvent.title} has been updated.`,
    });
  };

  const handleRescheduleEvent = (eventId: string, newDate: Date, newStartTime: string, newEndTime: string) => {
    setEvents(prev => prev.map(event => {
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
    }));
    
    toast({
      title: "Event Rescheduled",
      description: "Event has been moved to the new date and time.",
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "Event has been removed from your schedule.",
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowEventForm(true);
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
            onClick={() => setShowSlackPanel(true)}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Slack Integration
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
              <div className="space-y-2 text-sm">
                {['work', 'personal', 'health', 'meeting', 'appointment', 'social'].map(category => {
                  const count = events.filter(e => e.category === category).length;
                  return (
                    <div key={category} className="flex justify-between">
                      <span className="capitalize text-gray-600">{category}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  );
                })}
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

        {showSlackPanel && (
          <SlackIntegration
            events={events}
            onClose={() => setShowSlackPanel(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
