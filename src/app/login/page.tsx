'use client';

// =============================================================================
// VJTI Time Table Management System (TTMS)
// Screen S1: Authentication & Role Selection Portal
// Reference: Assignment 7 Section 4.2 (Table 10)
// =============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  User,
  GraduationCap,
  Briefcase,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'coordinator' | 'faculty' | 'student'>('coordinator');
  const [email, setEmail] = useState('coordinator@vjti.ac.in');
  const [password, setPassword] = useState('vjti@2026');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = {
    coordinator: {
      name: 'Dr. V. M. Phalle',
      email: 'coordinator@vjti.ac.in',
      desc: 'Timetable Committee Chair & Department Coordinator',
      dest: '/',
    },
    faculty: {
      name: 'Prof. M. A. Patil',
      email: 'ma_patil@ce.vjti.ac.in',
      desc: 'Assistant Professor, Computer Engineering',
      dest: '/faculty',
    },
    student: {
      name: 'VJTI Student',
      email: 'student@vjti.ac.in',
      desc: 'Third Year Computer Engineering (Div A)',
      dest: '/timetable',
    },
  };

  const handleRoleSelect = (selected: 'coordinator' | 'faculty' | 'student') => {
    setRole(selected);
    setEmail(demoAccounts[selected].email);
    setPassword('vjti@2026');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store auth session
      if (typeof window !== 'undefined') {
        localStorage.setItem('vjti_auth_token', data.token);
        localStorage.setItem('vjti_auth_user', JSON.stringify(data.user));
      }

      // Navigate to authorized screen
      if (data.user.role === 'coordinator') {
        router.push('/');
      } else if (data.user.role === 'faculty') {
        router.push('/faculty');
      } else {
        router.push('/timetable');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Institutional Header */}
        <div className="bg-indigo-700 px-6 py-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-indigo-100" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">VJTI Mumbai — TTMS</h1>
          <p className="text-xs text-indigo-200 mt-1">
            Department of Computer Engineering & Information Technology
          </p>
          <div className="inline-block mt-3 px-3 py-0.5 rounded-full bg-indigo-600/60 border border-indigo-400/30 text-[11px] font-medium text-indigo-100">
            Academic Year 2026–27
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-6">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Select User Role
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => handleRoleSelect('coordinator')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                role === 'coordinator'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 mb-1" />
              Coordinator
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('faculty')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                role === 'faculty'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4 mb-1" />
              Faculty
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                role === 'student'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 mb-1" />
              Student
            </button>
          </div>

          {/* Quick Demo Switcher Card */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 mb-6">
            <div className="flex items-center space-x-2 text-indigo-900 font-semibold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Demo Persona: {demoAccounts[role].name}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              {demoAccounts[role].desc}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="user@vjti.ac.in"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Default demo password: vjti@2026</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2 shadow-sm shadow-indigo-200 disabled:opacity-70"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Public Timetable Bypass Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/timetable"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Looking for student schedules? Open Public Timetable Viewer &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

