'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { Card } from '@/app/components/ui/Card';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

interface CalEvent { id: string; title: string; date: string; time: string; type: 'maintenance' | 'meeting' | 'deadline'; description: string; }

const EVENTS: CalEvent[] = [
  { id: '1', title: 'Monthly Maintenance Window', date: '2025-05-10', time: '02:00', type: 'maintenance', description: 'Scheduled downtime for server patching and updates.' },
  { id: '2', title: 'IT Team Standup', date: '2025-05-06', time: '09:00', type: 'meeting', description: 'Daily standup — review open tickets and blockers.' },
  { id: '3', title: 'SLA Review Deadline', date: '2025-05-15', time: '17:00', type: 'deadline', description: 'All P1 tickets must be resolved or escalated by this date.' },
  { id: '4', title: 'Network Upgrade', date: '2025-05-20', time: '22:00', type: 'maintenance', description: 'Core switch firmware upgrade in Building A.' },
  { id: '5', title: 'Quarterly IT Review', date: '2025-05-28', time: '14:00', type: 'meeting', description: 'Review Q2 metrics, SLA performance, and roadmap.' },
];

const TYPE_COLORS = { maintenance: '#F59E0B', meeting: '#3B82F6', deadline: '#EF4444' };
const TYPE_BG = { maintenance: 'var(--warning-100)', meeting: 'var(--info-100)', deadline: 'var(--error-100)' };
const TYPE_TEXT = { maintenance: 'var(--warning-700)', meeting: 'var(--info-700)', deadline: 'var(--error-700)' };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [today] = useState(new Date(2025, 4, 6)); // May 2025
  const [current, setCurrent] = useState(new Date(2025, 4, 1));
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return <EnterpriseLayout><div className="flex items-center justify-center h-full"><LoadingSpinner size="lg" /></div></EnterpriseLayout>;
  if (status !== 'authenticated') return null;

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return EVENTS.filter(e => e.date === dateStr);
  };

  const selectedEvents = selected ? EVENTS.filter(e => e.date === selected) : EVENTS.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>Calendar</h1>
          <p style={{ color: 'var(--gray-600)' }}>Maintenance windows, meetings, and IT deadlines</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--gray-900)' }}>{MONTHS[month]} {year}</h2>
                <div className="flex gap-2">
                  <button className="btn btn-secondary text-sm px-3 py-1.5 h-auto" onClick={() => setCurrent(new Date(year, month - 1, 1))}>‹</button>
                  <button className="btn btn-secondary text-sm px-3 py-1.5 h-auto" onClick={() => setCurrent(new Date(year, month + 1, 1))}>›</button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold py-1" style={{ color: 'var(--gray-500)' }}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayEvents = eventsForDay(day);
                  const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                  const isSelected = selected === dateStr;
                  return (
                    <button key={i} onClick={() => setSelected(isSelected ? null : dateStr)} className="relative p-1 rounded-lg text-sm transition-colors min-h-[48px] flex flex-col items-center" style={{ backgroundColor: isSelected ? 'var(--primary-100)' : isToday ? 'var(--primary-50)' : 'transparent', color: isToday ? 'var(--primary-700)' : 'var(--gray-800)', fontWeight: isToday ? 700 : 400 }}>
                      <span>{day}</span>
                      <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                        {dayEvents.slice(0, 3).map(e => <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TYPE_COLORS[e.type] }} />)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Events Panel */}
          <div>
            <Card padding="lg">
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--gray-900)' }}>
                {selected ? `Events on ${selected}` : 'Upcoming Events'}
              </h2>
              {selectedEvents.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>No events on this day.</p>
              ) : (
                <ul className="space-y-3">
                  {selectedEvents.map(e => (
                    <li key={e.id} className="p-3 rounded-lg" style={{ backgroundColor: TYPE_BG[e.type] }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold capitalize" style={{ color: TYPE_TEXT[e.type] }}>{e.type}</span>
                        <span className="text-xs" style={{ color: 'var(--gray-500)' }}>{e.time}</span>
                      </div>
                      <p className="text-sm font-bold mb-1" style={{ color: 'var(--gray-900)' }}>{e.title}</p>
                      <p className="text-xs" style={{ color: 'var(--gray-600)' }}>{e.description}</p>
                      {!selected && <p className="text-xs mt-1 font-medium" style={{ color: 'var(--gray-400)' }}>{e.date}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </EnterpriseLayout>
  );
}
