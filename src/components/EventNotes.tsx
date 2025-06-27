
import React, { useState, useRef } from 'react';
import { DailyEvent } from '@/types/daily';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, FileText, List, ListOrdered } from 'lucide-react';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    onUpdateNotes(notes);
    onClose();
  };

  const insertBulletPoint = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    const beforeText = notes.substring(0, start);
    const afterText = notes.substring(end);

    let newText;
    if (selectedText) {
      // If text is selected, add bullet to each line
      const lines = selectedText.split('\n');
      const bulletedLines = lines.map(line => line.trim() ? `• ${line}` : line);
      newText = beforeText + bulletedLines.join('\n') + afterText;
    } else {
      // If no selection, add bullet at cursor position
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const currentLine = beforeText.substring(lineStart);
      
      if (currentLine.trim() === '') {
        newText = beforeText + '• ' + afterText;
      } else {
        newText = beforeText + '\n• ' + afterText;
      }
    }

    setNotes(newText);
    
    // Focus textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? start + newText.length - notes.length : start + (currentLine.trim() === '' ? 2 : 3);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = notes.substring(start, end);
    const beforeText = notes.substring(0, start);
    const afterText = notes.substring(end);

    let newText;
    if (selectedText) {
      // If text is selected, add numbers to each line
      const lines = selectedText.split('\n');
      const numberedLines = lines.map((line, index) => 
        line.trim() ? `${index + 1}. ${line}` : line
      );
      newText = beforeText + numberedLines.join('\n') + afterText;
    } else {
      // If no selection, add number at cursor position
      const lineStart = beforeText.lastIndexOf('\n') + 1;
      const currentLine = beforeText.substring(lineStart);
      
      if (currentLine.trim() === '') {
        newText = beforeText + '1. ' + afterText;
      } else {
        newText = beforeText + '\n1. ' + afterText;
      }
    }

    setNotes(newText);
    
    // Focus textarea and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText ? start + newText.length - notes.length : start + (currentLine.trim() === '' ? 3 : 4);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
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
            
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={insertBulletPoint}
                className="flex items-center gap-1 text-xs"
              >
                <List className="w-3 h-3" />
                Bullets
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={insertNumberedList}
                className="flex items-center gap-1 text-xs"
              >
                <ListOrdered className="w-3 h-3" />
                Numbers
              </Button>
            </div>
            
            <Textarea
              ref={textareaRef}
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
