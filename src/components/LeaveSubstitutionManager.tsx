'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Faculty,
  LeaveRequest,
  Session,
  Substitution,
  Subject,
  TimeSlot,
  Batch,
  Room,
  FacultySubject,
  FacultyAvailability,
} from '../types/ttms';
import {
  getAffectedSessionsForLeave,
  AffectedSessionDetails,
} from '../lib/substitutionEngine';
import {
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  UserX,
  RotateCcw,
} from 'lucide-react';

interface LeaveSubstitutionManagerProps {
  leaveRequests: LeaveRequest[];
  substitutions: Substitution[];
  faculty: Faculty[];
  sessions: Session[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  batches: Batch[];
  rooms: Room[];
  facultySubjects: FacultySubject[];
  facultyAvailability: FacultyAvailability[];
  onAddLeaveRequest: (leave: LeaveRequest) => void;
  onConfirmSubstitution: (
    leaveId: string,
    sessionId: string,
    substituteFacultyId: string,
    subDate: string,
    reason: string
  ) => void;
  onRescheduleSession: (
    leaveId: string,
    sessionId: string,
    newSlotId: string,
    reason: string
  ) => void;
}

export default function LeaveSubstitutionManager({
  leaveRequests,
  substitutions,
  faculty,
  sessions,
  subjects,
  timeSlots,
  batches,
  rooms,
  facultySubjects,
  facultyAvailability,
  onAddLeaveRequest,
  onConfirmSubstitution,
}: LeaveSubstitutionManagerProps) {
  const [selectedLeaveId, setSelectedLeaveId] = useState<string>(
    leaveRequests[0]?.Leave_ID || ''
  );

  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [newFacultyId, setNewFacultyId] = useState(faculty[0]?.Faculty_ID || '');
  const [newFromDate, setNewFromDate] = useState('2026-10-20');
  const [newToDate, setNewToDate] = useState('2026-10-20');
  const [newReason, setNewReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const facultyMap = new Map(faculty.map((f) => [f.Faculty_ID, f]));
  const subjectMap = new Map(subjects.map((s) => [s.Subject_ID, s]));
  const batchMap = new Map(batches.map((b) => [b.Batch_ID, b]));
  const roomMap = new Map(rooms.map((r) => [r.Room_ID, r]));
  const slotMap = new Map(timeSlots.map((ts) => [ts.Slot_ID, ts]));

  const activeLeave =
    leaveRequests.find((l) => l.Leave_ID === selectedLeaveId) ||
    leaveRequests[0];

  const affectedSessions: AffectedSessionDetails[] = activeLeave
    ? getAffectedSessionsForLeave(
        activeLeave,
        sessions,
        timeSlots,
        subjects,
        faculty,
        facultySubjects,
        facultyAvailability
      )
    : [];

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId: newFacultyId,
          fromDate: newFromDate,
          toDate: newToDate,
          reason: newReason,
        }),
      });

      const data = await res.json();
      const leaveId = data.leave?.leave_id || `LEV_${Date.now()}`;
      const leave: LeaveRequest = {
        Leave_ID: leaveId,
        Faculty_ID: newFacultyId,
        From_Date: newFromDate,
        To_Date: newToDate,
        Reason: newReason,
        Status: 'Reported',
      };

      onAddLeaveRequest(leave);
      setSelectedLeaveId(leave.Leave_ID);
    } catch {
      const fallbackId = `LEV_${Date.now()}`;
      const leave: LeaveRequest = {
        Leave_ID: fallbackId,
        Faculty_ID: newFacultyId,
        From_Date: newFromDate,
        To_Date: newToDate,
        Reason: newReason,
        Status: 'Reported',
      };
      onAddLeaveRequest(leave);
      setSelectedLeaveId(leave.Leave_ID);
    } finally {
      setIsSubmitting(false);
      setShowAddLeaveModal(false);
      setNewReason('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
            <UserCheck className="w-4 h-4" />
            <span>Process 5.0 • Faculty Leave & Smart Substitution (D4 / D5)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            Leave Impact Analysis & Intelligent Substitute Recommendation
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Automates Fig. 7 Sequence Flow: matches affected sessions with free, subject-expert
            faculty within workload limits, avoiding manual timetable disruption.
          </p>
        </div>

        <button
          onClick={() => setShowAddLeaveModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Faculty Leave (FR-10)</span>
        </button>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-950 flex items-center space-x-2">
              <span>Active First-Come, First-Served (FCFS) Claim Marketplace</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">Live</span>
            </h4>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Colleague leaves automatically generate open claim opportunities. Faculty can claim them directly on their personal portal without waiting for manual coordinator re-assignment.
            </p>
          </div>
        </div>
        <Link
          href="/faculty"
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shrink-0 self-start sm:self-auto transition-colors"
        >
          <span>Open Faculty Claim Portal &rarr;</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Live FCFS Open Lecture Claims & Peer Coverage Status
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('vjti_refresh_data'));
                }
              }}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
              title="Refresh live leaves and substitution status"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {substitutions.filter((s) => s.Status === 'OPEN_FOR_CLAIM').length} Open for Claim
            </span>
          </div>
        </div>

        {substitutions.length === 0 ? (
          <div className="p-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs">
            No open or claimed lecture substitutions active right now. When a professor reports leave, their sessions will appear here as OPEN_FOR_CLAIM for peers to claim under FCFS.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Session / Subject</th>
                  <th className="py-2.5 px-3">Faculty on Leave</th>
                  <th className="py-2.5 px-3">Claim Status</th>
                  <th className="py-2.5 px-3">Assigned / Claiming Faculty</th>
                  <th className="py-2.5 px-3 text-right">Action / Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {substitutions.map((sub) => {
                  const leave = leaveRequests.find((l) => l.Leave_ID === sub.Leave_ID);
                  const origFac = leave ? facultyMap.get(leave.Faculty_ID) : null;
                  const sess = sessions.find((s) => s.Session_ID === sub.Session_ID);
                  const subObj = sess
                    ? subjectMap.get(sess.Subject_ID)
                    : subjects.find((s) => sub.Session_ID.includes(s.Subject_ID)) ||
                      (sub.Session_ID.includes('PMC') ? { Subject_Name: 'Major Project', Subject_Code: 'PROJ4' } : null);
                  const slot = sess ? slotMap.get(sess.Slot_ID) : timeSlots.find((ts) => sub.Session_ID.includes(ts.Slot_ID));
                  const claimFac = sub.Substitute_Faculty_ID ? facultyMap.get(sub.Substitute_Faculty_ID) : null;

                  return (
                    <tr key={sub.Sub_ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-800 font-mono">
                        {sub.Sub_Date}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{subObj?.Subject_Name || sub.Session_ID}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {slot ? `${slot.Day} P${slot.Period_No} (${slot.Start_Time}-${slot.End_Time})` : sub.Session_ID}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {origFac?.Faculty_Name || leave?.Faculty_ID || 'Faculty on Leave'}
                      </td>
                      <td className="py-3 px-3">
                        {sub.Status === 'OPEN_FOR_CLAIM' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>OPEN FOR CLAIM (FCFS)</span>
                          </span>
                        ) : sub.Status === 'CLAIMED' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>CLAIMED (FCFS)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <UserCheck className="w-3 h-3 text-indigo-600" />
                            <span>{sub.Status}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {claimFac ? (
                          <span className="text-emerald-700 font-bold">{claimFac.Faculty_Name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Awaiting peer claim</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href="/faculty"
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          View in Faculty Portal &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Faculty Leave Requests
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {leaveRequests.length} Total
            </span>
          </div>

          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <div className="p-6 text-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-7 h-7 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No active leave requests</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Click &quot;Record Faculty Leave&quot; above to report a professor&apos;s absence.
                </p>
              </div>
            ) : (
              leaveRequests.map((leave) => {
                const fac = facultyMap.get(leave.Faculty_ID);
                const isSelected = (activeLeave?.Leave_ID === leave.Leave_ID);

                return (
                  <div
                    key={leave.Leave_ID}
                    onClick={() => setSelectedLeaveId(leave.Leave_ID)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">
                        {fac?.Faculty_Name || leave.Faculty_ID}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          leave.Status === 'Reported'
                            ? 'bg-amber-100 text-amber-800'
                            : leave.Status === 'Processed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {leave.Status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{leave.Reason}</p>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center space-x-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{leave.From_Date}</span>
                      </span>
                      <span className="font-semibold text-indigo-600 text-[10px]">
                        View Impact →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeLeave ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">
                    Selected Leave File: {activeLeave.Leave_ID}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {facultyMap.get(activeLeave.Faculty_ID)?.Faculty_Name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5 italic">
                    &quot;{activeLeave.Reason}&quot;
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border">
                    Date: {activeLeave.From_Date}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Affected Scheduled Sessions ({affectedSessions.length})
                </h4>

                {affectedSessions.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                    <p className="text-sm font-bold">No Teaching Slots Impacted!</p>
                    <p className="text-xs text-emerald-700 mt-1">
                      This faculty has no scheduled classes on this date according to the timetable.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {affectedSessions.map((aff) => {
                      const { session, subjectName, slotDetails, candidates } = aff;
                      const batch = batchMap.get(session.Batch_ID);
                      const room = roomMap.get(session.Room_ID);

                      return (
                        <div
                          key={session.Session_ID}
                          className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-200">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-extrabold text-sm text-slate-900">
                                  {subjectName}
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                                  {session.Session_Type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Division: <strong>{batch?.Division}</strong> • Room: <strong>{room?.Room_No}</strong>
                              </p>
                            </div>

                            <div className="text-right font-mono text-xs font-semibold text-slate-700">
                              {slotDetails?.Day} • Period {slotDetails?.Period_No} ({slotDetails?.Start_Time} - {slotDetails?.End_Time})
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center space-x-2 mb-2.5">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                                Smart Recommendation Engine (FR-11)
                              </span>
                            </div>

                            <div className="space-y-2">
                              {candidates.slice(0, 3).map((cand) => {
                                const isBest = cand.score >= 80;
                                return (
                                  <div
                                    key={cand.faculty.Faculty_ID}
                                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                      isBest
                                        ? 'bg-emerald-50/60 border-emerald-300'
                                        : 'bg-white border-slate-200'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span className="font-bold text-xs text-slate-900">
                                          {cand.faculty.Faculty_Name}
                                        </span>
                                        {cand.isSubjectExpert && (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                            Subject Expert
                                          </span>
                                        )}
                                        {cand.isFreeAtSlot ? (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                                            Slot Free
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                                            Slot Clash
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        {cand.recommendationReason} (Load: {cand.currentLoad}/{cand.maxLoad}h)
                                      </p>
                                    </div>

                                    <button
                                      disabled={!cand.isFreeAtSlot}
                                      onClick={() =>
                                        onConfirmSubstitution(
                                          activeLeave.Leave_ID,
                                          session.Session_ID,
                                          cand.faculty.Faculty_ID,
                                          activeLeave.From_Date,
                                          `Assigned substitute ${cand.faculty.Faculty_Name} due to faculty leave`
                                        )
                                      }
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                        cand.isFreeAtSlot
                                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                      }`}
                                    >
                                      Assign Substitute (FR-12)
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
              <UserX className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold">Select or record a leave request on the left</p>
            </div>
          )}
        </div>
      </div>

      {showAddLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Faculty Leave / Unavailability (FR-10)
            </h3>

            <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Faculty Member</label>
                <select
                  value={newFacultyId}
                  onChange={(e) => setNewFacultyId(e.target.value)}
                  className="w-full border rounded-lg p-2 font-semibold"
                >
                  {faculty.map((f) => (
                    <option key={f.Faculty_ID} value={f.Faculty_ID}>
                      {f.Faculty_Name} ({f.Department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={newFromDate}
                    onChange={(e) => setNewFromDate(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={newToDate}
                    onChange={(e) => setNewToDate(e.target.value)}
                    className="w-full border rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reason for Leave / Duty
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Attending NBA Accreditation workshop or Medical leave"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full border rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddLeaveModal(false)}
                  className="px-3 py-1.5 text-slate-600 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Recording...' : 'Record Leave & Broadcast (FCFS)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
