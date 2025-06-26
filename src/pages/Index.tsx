
import React, { useState } from 'react';
import { CalendarHeader } from '@/components/CalendarHeader';
import { CalendarGrid } from '@/components/CalendarGrid';
import { EventForm } from '@/components/EventForm';
import { SlackIntegration } from '@/components/SlackIntegration';
import { TravelEvent } from '@/types/travel';
import { Button } from '@/components/ui/button';
import { Plus, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showSlackPanel, setShowSlackPanel] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  // Trip dates: July 3rd to July 10th, 2024
  const tripStartDate = new Date(2024, 6, 3); // Month is 0-indexed
  const tripEndDate = new Date(2024, 6, 10);

  const handleAddEvent = (eventData: Omit<TravelEvent, 'id'>) => {
    const newEvent: TravelEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setEvents(prev => [...prev, newEvent]);
    setShowEventForm(false);
    toast({
      title: "Event Added",
      description: `${eventData.title} has been added to your India trip schedule.`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto p-6">
        <CalendarHeader 
          tripStartDate={tripStartDate}
          tripEndDate={tripEndDate}
        />
        
        <div className="mb-6 flex gap-4">
          <Button 
            onClick={() => setShowEventForm(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
          <Button 
            onClick={() => setShowSlackPanel(true)}
            variant="outline"
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Slack Integration
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CalendarGrid
              tripStartDate={tripStartDate}
              tripEndDate={tripEndDate}
              events={events}
              onDateSelect={handleDateSelect}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Trip Overview</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Destination:</strong> India</p>
                <p><strong>Duration:</strong> 8 days</p>
                <p><strong>Total Events:</strong> {events.length}</p>
              </div>
            </div>
          </div>
        </div>

        {showEventForm && (
          <EventForm
            onSubmit={handleAddEvent}
            onClose={() => setShowEventForm(false)}
            selectedDate={selectedDate}
            tripStartDate={tripStartDate}
            tripEndDate={tripEndDate}
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
