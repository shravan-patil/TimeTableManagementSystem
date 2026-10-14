'use client';

import React, { useState } from 'react';
import { ChangeLog } from '../types/ttms';
import { History, Search, ShieldCheck, Clock, User, FileText } from 'lucide-react';

interface ChangeLogViewProps {
  changeLogs: ChangeLog[];
}

export default function ChangeLogView({ changeLogs }: ChangeLogViewProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const filteredLogs = changeLogs.filter((log) => {
    const matchesSearch =
      log.Description.toLowerCase().includes(search.toLowerCase()) ||
      log.Reason.toLowerCase().includes(search.toLowerCase()) ||
      log.Changed_By.toLowerCase().includes(search.toLowerCase()) ||
      log.Log_ID.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'ALL' || log.Change_Type === filterType;
    return matchesSearch && matchesType;
  });

  const typeColorMap: Record<string, string> = {
    Substitution: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Reschedule: 'bg-amber-100 text-amber-800 border-amber-200',
    'Room change': 'bg-blue-100 text-blue-800 border-blue-200',
    'Manual Edit': 'bg-purple-100 text-purple-800 border-purple-200',
    Generated: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Process 6.0 • Audit Trail Data Store (D5)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Timetable Revision History & Modification Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Systematic tamper-evident logging of all post-publication substitutions, room changes,
            and coordinator overrides (SRS FR-13).
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Audit Logging Active (ISO/NAAC Compliance)</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-80 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reason, coordinator, or details..."
            className="text-xs bg-transparent outline-none w-full"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-semibold">Filter by Change:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 font-semibold rounded-lg p-2 outline-none"
          >
            <option value="ALL">All Types ({changeLogs.length})</option>
            <option value="Substitution">Substitutions</option>
            <option value="Reschedule">Reschedules</option>
            <option value="Room change">Room Changes</option>
            <option value="Manual Edit">Manual Edits</option>
            <option value="Generated">Algorithm Runs</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="p-3.5 w-24">Log ID</th>
              <th className="p-3.5 w-32">Timestamp</th>
              <th className="p-3.5 w-32">Change Type</th>
              <th className="p-3.5">Details (Old / New Values)</th>
              <th className="p-3.5">Justification / Reason</th>
              <th className="p-3.5 w-36">Authorized User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.Log_ID} className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-mono font-bold text-indigo-700">{log.Log_ID}</td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {log.Changed_On}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        typeColorMap[log.Change_Type] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.Change_Type}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-800">{log.Description}</td>
                  <td className="p-3.5 text-slate-600 italic">&quot;{log.Reason}&quot;</td>
                  <td className="p-3.5 text-slate-700 font-medium">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.Changed_By}</span>
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  No audit log entries match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

