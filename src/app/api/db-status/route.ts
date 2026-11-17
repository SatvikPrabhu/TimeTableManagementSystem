import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET() {
  await db.ensureInitialized();
  return NextResponse.json({
    connectedToSupabase: db.isSupabaseConnected,
    source: db.isSupabaseConnected ? 'Supabase PostgreSQL (Cloud)' : 'Local In-Memory Relational Store (Fallback)',
    counts: {
      users: db.users.size,
      faculty: db.faculty.size,
      subjects: db.subjects.size,
      rooms: db.rooms.size,
      timeSlots: db.timeSlots.size,
      sessions: db.sessions.size,
      timetables: db.timetables.size,
      timetableEntries: db.timetableEntries.size,
      leaveRequests: db.leaveRequests.size,
      substitutions: db.substitutions.size,
    },
  });
}
