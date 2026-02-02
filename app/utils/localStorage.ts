import { CalendarEvent } from '@/types';

const STORAGE_KEY = 'calendar_events';

export const loadEvents = (): CalendarEvent[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading events from localStorage:', error);
    return [];
  }
};

export const saveEvents = (events: CalendarEvent[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error saving events to localStorage:', error);
  }
};

export const addEvent = (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): CalendarEvent => {
  const events = loadEvents();
  const now = new Date().toISOString();
  
  const newEvent: CalendarEvent = {
    ...event,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  
  events.push(newEvent);
  saveEvents(events);
  
  return newEvent;
};

export const updateEvent = (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>>): CalendarEvent | null => {
  const events = loadEvents();
  const index = events.findIndex(e => e.id === id);
  
  if (index === -1) return null;
  
  const updatedEvent: CalendarEvent = {
    ...events[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  events[index] = updatedEvent;
  saveEvents(events);
  
  return updatedEvent;
};

export const deleteEvent = (id: string): boolean => {
  const events = loadEvents();
  const filteredEvents = events.filter(e => e.id !== id);
  
  if (filteredEvents.length === events.length) return false;
  
  saveEvents(filteredEvents);
  return true;
};

export const getEventsByDate = (date: string): CalendarEvent[] => {
  const events = loadEvents();
  return events.filter(e => e.date === date);
};

export const getUpcomingEvents = (limit: number = 5): CalendarEvent[] => {
  const events = loadEvents();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return events
    .filter(e => {
      const eventDate = new Date(e.date + 'T00:00:00');
      return eventDate >= today;
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    })
    .slice(0, limit);
};
