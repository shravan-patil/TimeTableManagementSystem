'use client';

import React from 'react';
import { Timetable, ConflictItem, Notification } from '../types/ttms';
import { Bell, ShieldCheck, AlertTriangle, Calendar, Award } from 'lucide-react';

interface HeaderProps {
  timetable: Timetable;
  conflicts: ConflictItem[];
  notifications: Notification[];
  onOpenNotifications: () => void;
}

export default function Header({
  timetable,
  conflicts,
  notifications,
  onOpenNotifications,
}: HeaderProps) {
  const unreadCount = notifications.filter((n) => !n.Is_Read).length;

  const statusColors: Record<string, string> = {
    'Draft Generated': 'bg-amber-100 text-amber-800 border-amber-300',
    'Under Review': 'bg-blue-100 text-blue-800 border-blue-300',
    'Finalized': 'bg-purple-100 text-purple-800 border-purple-300',
    'Published': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Revised': 'bg-orange-100 text-orange-800 border-orange-300',
    'Archived': 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Institute Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Award className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  VJTI Mumbai • Dept. of CE & IT
                </span>
                <span className="text-xs text-slate-500 font-mono">Academic Year 2026–27</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                Time Table Management System
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Institutional Timetable Generation, Scheduling & Conflict Management
              </p>
            </div>
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center space-x-4">
            {/* Timetable Status Pill */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Schedule State
              </span>
              <div
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  statusColors[timetable.Status] || 'bg-slate-100 text-slate-800 border-slate-300'
                } flex items-center space-x-1.5 shadow-sm`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                <span>{timetable.Status}</span>
                <span className="text-[10px] opacity-75 font-mono">v{timetable.Version_No}</span>
              </div>
            </div>

            {/* Conflict Status Badge */}
            <div className="hidden lg:flex items-center">
              {conflicts.length === 0 ? (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>0 Conflicts</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 text-xs font-medium animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>{conflicts.length} Active Conflict{conflicts.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Change Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <div className="flex items-center pl-3 border-l border-slate-200 space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                VP
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">Dr. V. M. Phalle</p>
                <p className="text-[11px] text-slate-500 mt-0.5">TT Committee Coordinator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

