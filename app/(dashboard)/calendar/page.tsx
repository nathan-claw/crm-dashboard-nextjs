'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEvent, EventCategory } from '@/types';
import EventModal from '@/app/components/EventModal';
import EventDetailsModal from '@/app/components/EventDetailsModal';
import { loadEvents, addEvent, updateEvent, deleteEvent, getUpcomingEvents } from '@/app/utils/localStorage';

const CATEGORY_COLORS: Record<EventCategory, string> = {
  meeting: 'bg-blue-500',
  holiday: 'bg-red-400',
  conference: 'bg-purple-500',
  birthday: 'bg-pink-500',
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  meeting: 'Meeting',
  holiday: 'Holiday',
  conference: 'Conference',
  birthday: 'Birthday',
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [eventModalMode, setEventModalMode] = useState<'create' | 'edit'>('create');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [categoryFilters, setCategoryFilters] = useState<Set<EventCategory>>(
    new Set(['meeting', 'holiday', 'conference', 'birthday'])
  );

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getEventsForDate = (dateKey: string): CalendarEvent[] => {
    return events.filter(
      (event) => event.date === dateKey && categoryFilters.has(event.category)
    );
  };

  const handleDateClick = (day: number) => {
    const dateKey = formatDateKey(new Date(year, month, day));
    setSelectedDate(dateKey);
    setEventModalMode('create');
    setEditingEvent(undefined);
    setIsEventModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (eventModalMode === 'create') {
      addEvent(eventData);
    } else if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    }
    setEvents(loadEvents());
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventModalMode('edit');
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    setEvents(loadEvents());
  };

  const toggleCategoryFilter = (category: EventCategory) => {
    const newFilters = new Set(categoryFilters);
    if (newFilters.has(category)) {
      newFilters.delete(category);
    } else {
      newFilters.add(category);
    }
    setCategoryFilters(newFilters);
  };

  const upcomingEvents = getUpcomingEvents(5).filter((event) =>
    categoryFilters.has(event.category)
  );

  const renderCalendarDays = () => {
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Previous month days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push(
        <div
          key={`prev-${day}`}
          className="min-h-[100px] md:min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        >
          <div className="text-sm text-gray-400 dark:text-gray-600">{day}</div>
        </div>
      );
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(new Date(year, month, day));
      const dayEvents = getEventsForDate(dateKey);
      const isToday =
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className="min-h-[100px] md:min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors group"
        >
          <div
            className={`text-sm font-medium mb-1 ${
              isToday
                ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                onClick={(e) => handleEventClick(event, e)}
                className={`text-xs px-2 py-1 rounded text-white truncate hover:opacity-80 transition-opacity ${
                  CATEGORY_COLORS[event.category]
                }`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="min-h-[100px] md:min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
        >
          <div className="text-sm text-gray-400 dark:text-gray-600">{day}</div>
        </div>
      );
    }

    return days;
  };

  const formatUpcomingDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Schedule and manage your events</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Create Event Button */}
          <button
            onClick={() => {
              setSelectedDate(formatDateKey(new Date()));
              setEventModalMode('create');
              setEditingEvent(undefined);
              setIsEventModalOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create event
          </button>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming events</h3>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No Upcoming Event</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsDetailsModalOpen(true);
                    }}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${CATEGORY_COLORS[event.category]}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatUpcomingDate(event.date)} • {event.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Categories Filter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Categories</h3>
              </div>
            </div>
            <div className="space-y-2">
              {(Object.keys(CATEGORY_COLORS) as EventCategory[]).map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={categoryFilters.has(category)}
                    onChange={() => toggleCategoryFilter(category)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[category]}`}></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{CATEGORY_LABELS[category]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="w-[72px] md:w-[88px]"></div>
            </div>

            {/* Calendar Grid */}
            <div className="p-2 md:p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-0 mb-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-0">{renderCalendarDays()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EventModal
        mode={eventModalMode}
        event={editingEvent}
        selectedDate={selectedDate || undefined}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
      />

      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
}
