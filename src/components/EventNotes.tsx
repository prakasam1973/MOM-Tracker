
import React, { useState } from 'react';
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, FileText } from 'lucide-react';

interface EventNotesProps {
  isOpen: boolean;
  onClose: () => void;
  event: DailyEvent;
  onUpdateNotes: (notes: string) => void;
}

export const EventNotes: React.FC<EventNotesProps> = ({
  isOpen,
  onClose,
  event,
  onUpdateNotes,
}) => {
  const [notes, setNotes] = useState(event.notes || '');

  const handleSave = () => {
    onUpdateNotes(notes);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Event Notes</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-600">{event.description}</p>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes about this event..."
              rows={6}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              Save Notes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
