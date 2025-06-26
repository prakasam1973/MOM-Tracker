
import React from 'react';
import { format } from 'date-fns';
import { MapPin, Calendar } from 'lucide-react';

interface CalendarHeaderProps {
  tripStartDate: Date;
  tripEndDate: Date;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  tripStartDate,
  tripEndDate,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            India Travel Calendar
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {format(tripStartDate, 'MMM dd')} - {format(tripEndDate, 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>India</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-orange-600">
            {Math.ceil((tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} Days
          </div>
          <div className="text-sm text-gray-500">Trip Duration</div>
        </div>
      </div>
    </div>
  );
};
