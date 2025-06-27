
import React, { useState } from 'react';
import { format, isSameDay, addDays, startOfWeek } from 'date-fns';
import { DailyEvent } from '@/types/daily';
import { EventCard } from '@/components/EventCard';
import { PrintView } from '@/components/PrintView';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarGridProps {
  events: DailyEvent[];
  onDateSelect: (date: Date) => void;
  onDeleteEvent: (eventId: string) => void;
  onUpdateEvent: (event: DailyEvent) => void;
  onRescheduleEvent: (eventId: string, newDate: Date, newStartTime: string, newEndTime: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  onDateSelect,
  onDeleteEvent,
  onUpdateEvent,
  onRescheduleEvent,
}) => {
  const [printDate, setPrintDate] = useState<Date | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 1 }); // Start week on Monday
  });

  const getDaysInWeek = () => {
    const days = [];
    // Only show Monday to Friday (5 days)
    for (let i = 0; i < 5; i++) {
      days.push(addDays(currentWeekStart, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = addDays(currentWeekStart, direction === 'next' ? 7 : -7);
    setCurrentWeekStart(newWeekStart);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
  };

  const days = getDaysInWeek();
  const today = new Date();

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Weekly Schedule (Mon-Fri)</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              Previous Week
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              Next Week
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = isSameDay(day, today);
            
            return (
              <div key={index} className={`border rounded-lg p-4 transition-colors ${
                isToday ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`text-lg font-medium ${
                      isToday ? 'text-blue-800' : 'text-gray-800'
                    }`}>
                      {format(day, 'EEEE, MMMM dd')}
                      {isToday && <span className="ml-2 text-sm text-blue-600">(Today)</span>}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrintDate(day)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      Print Day
                    </Button>
                    <button
                      onClick={() => onDateSelect(day)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Add Event
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {dayEvents.length > 0 ? (
                    dayEvents.map(event => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onDelete={onDeleteEvent}
                        onUpdate={onUpdateEvent}
                        onReschedule={onRescheduleEvent}
                        allEvents={events}
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

      {printDate && (
        <PrintView
          date={printDate}
          events={getEventsForDate(printDate)}
          onClose={() => setPrintDate(null)}
        />
      )}
    </>
  );
};
