import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BellRing, Play, RotateCcw, Calendar, Clock, Mail, MessageSquare,
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Sparkles,
  Search, Filter, Info, Eye, Check, X, ArrowRight, UserCheck,
  Send, RefreshCw, Smartphone, Stethoscope, ChevronRight, Zap
} from 'lucide-react';

import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { notificationService } from '../../services/api/notificationService';
import type { NotificationItem, DemoStateResponse } from '../../services/api/notificationService';

export function DoctorNotificationsPage() {
  const [demoState, setDemoState] = useState<DemoStateResponse | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    emails: 0,
    sms: 0,
    staffAlerts: 0,
    skipped: 0,
    failed: 0,
  });

  const [simulationDate, setSimulationDate] = useState('2026-10-08');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [running, setRunning] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [togglingTest, setTogglingTest] = useState(false);
  
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastExecutionReport, setLastExecutionReport] = useState<any | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [stateRes, notifRes] = await Promise.all([
        notificationService.getDemoState(),
        notificationService.getNotifications({
          channel: selectedChannel,
          status: selectedStatus,
          search: searchQuery,
        })
      ]);
      setDemoState(stateRes);
      if (stateRes.simulationDate) {
        setSimulationDate(stateRes.simulationDate);
      }
      setNotifications(notifRes.items || []);
      setStats({
        total: notifRes.total || 0,
        emails: notifRes.emails || 0,
        sms: notifRes.sms || 0,
        staffAlerts: notifRes.staffAlerts || 0,
        skipped: notifRes.skipped || 0,
        failed: notifRes.failed || 0,
      });
    } catch (e: any) {
      console.error('Failed to fetch notification data:', e);
    }
  }, [selectedChannel, selectedStatus, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRunAutomation = async (customDate?: string) => {
    const targetDate = customDate || simulationDate;
    setRunning(true);
    try {
      const res = await notificationService.runAutomation(targetDate, true);
      setLastExecutionReport(res);
      showToast(`Automation Executed (${targetDate}): ${res.scenariosDetected} scenario(s) processed.`);
      await loadData();
    } catch (e: any) {
      showToast(`Automation failed: ${e.message}`);
    } finally {
      setRunning(false);
    }
  };

  const handleResetDemo = async () => {
    setResetting(true);
    try {
      await notificationService.resetDemo();
      setLastExecutionReport(null);
      setSimulationDate('2026-10-08');
      showToast('Demo reset: Ravi Kumar (Blood Test: Pending, Appt: 15 Oct, Clean Baseline)');
      await loadData();
    } catch (e: any) {
      showToast(`Reset failed: ${e.message}`);
    } finally {
      setResetting(false);
    }
  };

  const handleToggleTestStatus = async () => {
    setTogglingTest(true);
    try {
      const currentStatus = demoState?.requiredTest?.status;
      if (currentStatus === 'completed') {
        await notificationService.revertTest('TEST-RAVI-001');
        showToast('Blood test reverted to Pending');
      } else {
        await notificationService.completeTest('TEST-RAVI-001');
        showToast('✓ Blood test marked Completed! CareFlow stopped test-missing reminder workflow.');
      }
      await loadData();
    } catch (e: any) {
      showToast(`Toggle failed: ${e.message}`);
    } finally {
      setTogglingTest(false);
    }
  };

  const timelineHorizons = [
    { date: '2026-10-08', label: '08 OCT', tVal: 'T-7', title: 'Test Missing Early', channel: 'Email', scenarioKey: 'test_missing_early' },
    { date: '2026-10-12', label: '12 OCT', tVal: 'T-3', title: 'Test Still Missing', channel: 'Email + SMS', scenarioKey: 'test_missing_urgent' },
    { date: '2026-10-13', label: '13 OCT', tVal: 'T-2', title: 'Staff Action Alert', channel: 'Staff Alert', scenarioKey: 'staff_missing_test' },
    { date: '2026-10-14', label: '14 OCT', tVal: 'T-1', title: demoState?.requiredTest?.status === 'completed' ? 'Appointment Reminder' : 'Final Test Reminder', channel: demoState?.requiredTest?.status === 'completed' ? 'SMS' : 'Email + SMS', scenarioKey: 'test_missing_final' },
    { date: '2026-10-15', label: '15 OCT', tVal: 'T-0', title: demoState?.requiredTest?.status === 'completed' ? 'Morning Check-in' : 'Missing Test at Arrival', channel: demoState?.requiredTest?.status === 'completed' ? 'SMS' : 'Email + SMS', scenarioKey: 'appointment_morning' },
    { date: '2026-10-16', label: '16 OCT', tVal: 'Post-Appt', title: 'Missed Appt Check', channel: 'Email + SMS', scenarioKey: 'missed_appointment' },
  ];

  return (
    <DoctorLayout activeTab="notifications" toastMessage={toastMessage}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Status Banner */}
        <div className="bg-gradient-to-r from-[#052429] via-[#07363d] to-[#052429] border border-[#0e4851] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#00e575]/10 to-transparent pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#072d33] border border-[#0e4851] text-[#00e575]">
                  <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse-soft" /> CareFlow Automation Running
                </span>
                <span className="text-teal-300 text-[11px] font-mono">
                  Timezone: {demoState?.timezone || 'Asia/Kolkata'} • Daily Run: 09:00 AM IST
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <BellRing className="w-7 h-7 text-[#00e575]" />
                Patient Reminder & Notification Automation
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-3xl">
                Deterministic care-plan monitoring engine. Evaluates diagnostic test dependencies, applies multi-channel T-X dispatch, and adapts dynamically to patient clinical state changes.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleResetDemo}
                disabled={resetting}
                className="px-3.5 py-2.5 rounded-xl bg-[#0a383f] hover:bg-[#0e4851] border border-[#145d68] text-xs font-bold text-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                Reset Demo Baseline
              </button>

              <button
                onClick={() => handleRunAutomation()}
                disabled={running}
                className="px-4 py-2.5 rounded-xl bg-[#00e575] hover:bg-[#00c865] text-[#052429] text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                <Play className={`w-4 h-4 fill-current ${running ? 'animate-pulse' : ''}`} />
                {running ? 'Running Engine...' : 'Run Automation Now'}
              </button>
            </div>
          </div>
        </div>

        {/* DEMO CONTROL PANEL: Simulation Date & Scenario Driver */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                JURY DEMONSTRATION CONTROLLER
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Controlled Simulation Date & Core Demo Scenario
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Core Patient:</span>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {demoState?.patient?.name || 'Ravi Kumar'} ({demoState?.patient?.id || 'MRN-RAVI-001'})
              </span>
            </div>
          </div>

          {/* Core Demo Story Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">APPOINTMENT</span>
              <div className="font-bold text-slate-900 text-sm">{demoState?.appointment?.date || '15 October 2026'}</div>
              <div className="text-slate-600">{demoState?.appointment?.doctor || 'Dr. Rajesh Mehta'} • {demoState?.appointment?.department || 'Cardiology'}</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">REQUIRED DIAGNOSTIC TEST</span>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                {demoState?.requiredTest?.name || 'Blood Test (Fasting Lipid & Renal Panel)'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border ${
                  demoState?.requiredTest?.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${demoState?.requiredTest?.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {demoState?.requiredTest?.status === 'completed' ? '✓ Verified Completed' : '● Status: Pending'}
                </span>
                {demoState?.requiredTest?.completedAt && (
                  <span className="text-[10px] text-slate-500 font-mono">at {demoState.requiredTest.completedAt}</span>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <button
                onClick={handleToggleTestStatus}
                disabled={togglingTest}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                  demoState?.requiredTest?.status === 'completed'
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700'
                }`}
              >
                {demoState?.requiredTest?.status === 'completed' ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" /> Revert Test to Pending
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Blood Test Completed
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Simulation Date Switcher Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Select Demo Simulation Date:</span>
              <span className="font-mono text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Active Simulation Date: {simulationDate}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {timelineHorizons.map((item) => {
                const isActive = simulationDate === item.date;
                return (
                  <button
                    key={item.date}
                    onClick={() => {
                      setSimulationDate(item.date);
                      handleRunAutomation(item.date);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? 'bg-[#052429] text-white border-[#00e575] shadow-md ring-2 ring-[#00e575]/30'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-bold uppercase ${isActive ? 'text-[#00e575]' : 'text-slate-500'}`}>
                        {item.tVal}
                      </span>
                      <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-900'}`}>
                        {item.label}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className={`text-xs font-bold truncate ${isActive ? 'text-teal-200' : 'text-slate-800'}`}>
                        {item.title}
                      </div>
                      <div className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-teal-300/80' : 'text-slate-500'}`}>
                        {item.channel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* CARE COORDINATION DYNAMIC STATE INSIGHT */}
        {demoState?.careInsight && (
          <div className={`rounded-2xl p-5 border shadow-xs transition-all ${
            demoState.requiredTest?.status === 'completed'
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/80 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                demoState.requiredTest?.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                <Zap className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-sm font-black uppercase tracking-tight">
                    {demoState.careInsight.title}
                  </h3>
                  <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    demoState.requiredTest?.status === 'completed'
                      ? 'bg-emerald-200 text-emerald-900 border-emerald-400'
                      : 'bg-amber-200 text-amber-900 border-amber-400'
                  }`}>
                    Live State Adaptation
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="font-bold block opacity-70">CARE STATE TRANSITION:</span>
                    <span className="font-semibold">{demoState.careInsight.currentState}</span>
                  </div>
                  <div>
                    <span className="font-bold block opacity-70">AUTOMATION RESPONSE:</span>
                    <span className="font-bold">{demoState.careInsight.automationResponse}</span>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed pt-1 border-t border-black/10">
                  {demoState.careInsight.ruleInsight}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* METRIC COUNTERS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Logs</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{stats.total}</div>
            <span className="text-[10px] text-slate-400 font-mono">Recorded events</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-teal-800 uppercase block flex items-center gap-1">
              <Mail className="w-3 h-3 text-teal-700" /> Emails
            </span>
            <div className="text-2xl font-black text-teal-900 mt-0.5">{stats.emails}</div>
            <span className="text-[10px] text-teal-700/80 font-mono">Gemini AI / Fallback</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-sky-800 uppercase block flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-sky-700" /> SMS Dispatches
            </span>
            <div className="text-2xl font-black text-sky-900 mt-0.5">{stats.sms}</div>
            <span className="text-[10px] text-sky-700/80 font-mono">DLT Template Compliant</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase block flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-700" /> Staff Alerts
            </span>
            <div className="text-2xl font-black text-amber-900 mt-0.5">{stats.staffAlerts}</div>
            <span className="text-[10px] text-amber-700/80 font-mono">T-2 Coordinators</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-600 uppercase block">Deduplicated</span>
            <div className="text-2xl font-black text-slate-700 mt-0.5">{stats.skipped}</div>
            <span className="text-[10px] text-slate-400 font-mono">Duplicate-prevented</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800 uppercase block">Delivery Mode</span>
            <div className="text-xs font-black text-emerald-900 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Simulation Mode</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Clear Demo Provenance</span>
          </div>
        </div>

        {/* NOTIFICATION EVENT LOGS TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Controls */}
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notification Execution Logs</span>
              <span className="text-xs font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {notifications.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search Bar */}
              <div className="relative w-48 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subject, patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              {/* Channel Filter */}
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                aria-label="Filter by channel"
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Channels</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="staff_alert">Staff Alert</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter by status"
                className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent / Simulated</option>
                <option value="skipped">Skipped</option>
                <option value="failed">Failed</option>
              </select>

              <button
                onClick={() => loadData()}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Refresh Logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Scenario</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">AI / Template Mode</th>
                  <th className="py-3 px-4">Sim Date / Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.patientName}
                      <span className="text-[10px] text-slate-400 block font-normal font-mono">{item.patientId}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.scenario.replace(/_/g, ' ').toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded border uppercase ${
                        item.channel === 'email'
                          ? 'bg-teal-50 text-teal-800 border-teal-200'
                          : item.channel === 'sms'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {item.channel === 'email' && <Mail className="w-3 h-3" />}
                        {item.channel === 'sms' && <Smartphone className="w-3 h-3" />}
                        {item.channel === 'staff_alert' && <AlertTriangle className="w-3 h-3" />}
                        {item.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        item.status === 'sent' || item.status === 'simulated'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.status === 'skipped'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'sent' || item.status === 'simulated'
                            ? 'bg-emerald-500'
                            : item.status === 'skipped'
                            ? 'bg-slate-400'
                            : 'bg-red-500'
                        }`} />
                        {item.status === 'simulated' ? '✓ Simulation Sent' : item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {item.aiGenerationMode === 'gemini_ai' && (
                        <span className="text-teal-700 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#00e575]" /> Gemini AI
                        </span>
                      )}
                      {item.aiGenerationMode === 'fallback_template' && (
                        <span className="text-slate-600">Fallback Template</span>
                      )}
                      {item.aiGenerationMode === 'dlt_template' && (
                        <span className="text-sky-700 font-semibold">DLT Approved</span>
                      )}
                      {item.aiGenerationMode === 'duplicate_suppressed' && (
                        <span className="text-slate-400 italic">Deduplicated</span>
                      )}
                      {item.aiGenerationMode === 'staff_template' && (
                        <span className="text-amber-800 font-semibold">Staff Escalation</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {item.simulationDate ? `Sim: ${item.simulationDate}` : item.sentAt || '---'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedNotification(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}

                {notifications.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <BellRing className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-700 text-xs">No notification records match criteria</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Click "Run Automation Now" above to trigger care plan monitoring.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NOTIFICATION INSPECTION MODAL */}
      <AnimatePresence>
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black shrink-0 ${
                    selectedNotification.channel === 'email'
                      ? 'bg-teal-100 text-teal-800'
                      : selectedNotification.channel === 'sms'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedNotification.channel === 'email' && <Mail className="w-4 h-4" />}
                    {selectedNotification.channel === 'sms' && <Smartphone className="w-4 h-4" />}
                    {selectedNotification.channel === 'staff_alert' && <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                        {selectedNotification.scenario.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {selectedNotification.status.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-0.5">
                      {selectedNotification.subject || 'Notification Dispatch'}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* Audit Metadata Card */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Recipient Patient</span>
                    <span className="font-bold text-slate-900">{selectedNotification.patientName}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">{selectedNotification.recipientEmail || selectedNotification.recipientPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">AI / Generation Mode</span>
                    <span className="font-mono text-teal-800 font-bold">{selectedNotification.aiGenerationMode || 'Standard'}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">{selectedNotification.providerMessageId || 'Provider ID Generated'}</span>
                  </div>
                </div>

                {/* Formatted Message Content */}
                <div className="space-y-1.5">
                  <span className="font-bold text-slate-800 block text-xs">Formatted Message Payload:</span>
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                    {selectedNotification.message}
                  </div>
                </div>

                {/* Delivery Notice */}
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Delivery Mode: <strong>Simulation Mode (DLT & SMTP Safe)</strong>. Real messages dispatch automatically when production SMTP / SMS credentials are provided.
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end">
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DoctorLayout>
  );
}

export default DoctorNotificationsPage;
