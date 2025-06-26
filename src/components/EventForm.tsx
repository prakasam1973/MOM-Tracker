
import React, { useState } from 'react';
import { TravelEvent } from '@/types/travel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface EventFormProps {
  onSubmit: (event: Omit<TravelEvent, 'id'>) => void;
  onClose: () => void;
  selectedDate: Date | null;
  tripStartDate: Date;
  tripEndDate: Date;
}

export const EventForm: React.FC<EventFormProps> = ({
  onSubmit,
  onClose,
  selectedDate,
  tripStartDate,
  tripEndDate,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(tripStartDate, 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    category: 'activity' as TravelEvent['category'],
    priority: 'medium' as TravelEvent['priority'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: Omit<TravelEvent, 'id'> = {
      ...formData,
      date: new Date(formData.date),
    };
    
    onSubmit(eventData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New Event</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Flight to Delhi"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Event details..."
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              min={format(tripStartDate, 'yyyy-MM-dd')}
              max={format(tripEndDate, 'yyyy-MM-dd')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g., Mumbai Airport"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
              required
            >
              <option value="flight">Flight</option>
              <option value="hotel">Hotel</option>
              <option value="activity">Activity</option>
              <option value="meeting">Meeting</option>
              <option value="meal">Meal</option>
              <option value="transport">Transport</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700">
              Add Event
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
