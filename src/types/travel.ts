
export interface TravelEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  category: 'flight' | 'hotel' | 'activity' | 'meeting' | 'meal' | 'transport' | 'other';
  priority: 'low' | 'medium' | 'high';
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
