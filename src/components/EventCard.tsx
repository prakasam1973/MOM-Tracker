
import React from 'react';
import { TravelEvent } from '@/types/travel';
import { Clock, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventCardProps {
  event: TravelEvent;
  onDelete: (eventId: string) => void;
}

const categoryColors = {
  flight: 'bg-blue-100 text-blue-800 border-blue-200',
  hotel: 'bg-green-100 text-green-800 border-green-200',
  activity: 'bg-purple-100 text-purple-800 border-purple-200',
  meeting: 'bg-red-100 text-red-800 border-red-200',
  meal: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  transport: 'bg-gray-100 text-gray-800 border-gray-200',
  other: 'bg-orange-100 text-orange-800 border-orange-200',
};

const priorityColors = {
  low: 'border-l-gray-400',
  medium: 'border-l-yellow-400',
  high: 'border-l-red-400',
};

export const EventCard: React.FC<EventCardProps> = ({ event, onDelete }) => {
  return (
    <div className={`border-l-4 ${priorityColors[event.priority]} bg-white p-3 rounded-r border border-l-0 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-gray-800">{event.title}</h4>
            <span className={`px-2 py-1 text-xs rounded-full border ${categoryColors[event.category]}`}>
              {event.category}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{event.startTime} - {event.endTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(event.id)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
