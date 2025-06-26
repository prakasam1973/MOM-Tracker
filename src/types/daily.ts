
export interface DailyEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  category: 'work' | 'personal' | 'health' | 'meeting' | 'appointment' | 'social' | 'other';
  priority: 'low' | 'medium' | 'high';
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  originalEventId?: string;
}

export interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
}

export interface SlackConfig {
  webhookUrl: string;
  channel: string;
  username: string;
}
