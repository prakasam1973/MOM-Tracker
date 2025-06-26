
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { TravelEvent } from '@/types/travel';
import { EventCard } from '@/components/EventCard';

interface CalendarGridProps {
  tripStartDate: Date;
  tripEndDate: Date;
  events: TravelEvent[];
  onDateSelect: (date: Date) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  tripStartDate,
  tripEndDate,
  events,
  onDateSelect,
  onDeleteEvent,
}) => {
  const getDaysInTrip = () => {
    const days = [];
    const currentDate = new Date(tripStartDate);
    
    while (currentDate <= tripEndDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const days = getDaysInTrip();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Trip Schedule</h2>
      <div className="space-y-4">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          
          return (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    {format(day, 'EEEE, MMMM dd')}
                  </h3>
                  <p className="text-sm text-gray-500">Day {index + 1} of trip</p>
                </div>
                <button
                  onClick={() => onDateSelect(day)}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Add Event
                </button>
              </div>
              
              <div className="space-y-2">
                {dayEvents.length > 0 ? (
                  dayEvents.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onDelete={onDeleteEvent}
                    />
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic">No events scheduled</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
