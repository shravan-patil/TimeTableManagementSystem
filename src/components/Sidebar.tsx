'use client';

import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  Database,
  BarChart3,
  UserCheck,
  Building2,
  History,
  FileCheck2,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'generator'
  | 'grid'
  | 'master'
  | 'workload'
  | 'leave'
  | 'occupancy'
  | 'changelog';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  conflictCount: number;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  conflictCount,
}: SidebarProps) {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null,
      dfd: 'Overview',
    },
    {
      id: 'generator' as NavTab,
      label: 'Generate Timetable',
      icon: Sparkles,
      badge: 'Auto',
      dfd: 'Process 2.0',
    },
    {
      id: 'grid' as NavTab,
      label: 'Timetable Grid & Editor',
      icon: CalendarDays,
      badge: conflictCount > 0 ? `${conflictCount} clashes` : null,
      badgeColor: 'bg-rose-500 text-white',
      dfd: 'Process 3.0 & 6.0',
    },
    {
      id: 'master' as NavTab,
      label: 'Master Data Manager',
      icon: Database,
      badge: null,
      dfd: 'Process 1.0 (D1)',
    },
    {
      id: 'workload' as NavTab,
      label: 'Workload & Availability',
      icon: BarChart3,
      badge: null,
      dfd: 'Process 4.0 (D3)',
    },
    {
      id: 'leave' as NavTab,
      label: 'Leave & Substitution',
      icon: UserCheck,
      badge: 'Smart Match',
      badgeColor: 'bg-indigo-600 text-white',
      dfd: 'Process 5.0 (D4)',
    },
    {
      id: 'occupancy' as NavTab,
      label: 'Room Utilization',
      icon: Building2,
      badge: null,
      dfd: 'FR-9',
    },
    {
      id: 'changelog' as NavTab,
      label: 'Change Log Audit Trail',
      icon: History,
      badge: null,
      dfd: 'Process 6.0 (D5)',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-5rem)] border-r border-slate-800 no-print">
      <div className="p-4 border-b border-slate-800">
        <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-400">
            Coordinator Portal
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Department Timetable Committee Management Console
          </p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3 text-left">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div>
                  <div className="leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{item.dfd}</div>
                </div>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>System Compliant: SRS v1.0</span>
        </div>
        <p className="text-[11px] text-slate-500">
          ERD & DFD Model v1.0 • VJTI CE & IT
        </p>
      </div>
    </aside>
  );
}

