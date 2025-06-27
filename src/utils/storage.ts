
import { DailyEvent } from '@/types/daily';

const STORAGE_KEY = 'daily-events';

export const saveEvents = (events: DailyEvent[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events to localStorage:', error);
  }
};

export const loadEvents = (): DailyEvent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const events = JSON.parse(stored);
    // Convert date strings back to Date objects
    return events.map((event: any) => ({
      ...event,
      date: new Date(event.date)
    }));
  } catch (error) {
    console.error('Failed to load events from localStorage:', error);
    return [];
  }
};

export const clearEvents = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear events from localStorage:', error);
  }
};
