import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { EmailService } from '@/server/services/EmailService';

/**
 * GET /api/notifications
 * Retrieves notifications list or recent email outbox audit logs
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const recipientId = searchParams.get('userId');
  const type = searchParams.get('type');

  if (type === 'outbox') {
    return NextResponse.json(EmailService.getOutboxLogs());
  }

  let notifications = Array.from(db.notifications.values());
  if (recipientId) {
    notifications = notifications.filter((n) => n.recipient_id === recipientId);
  }

  // Sort descending by timestamp
  notifications.sort((a, b) => new Date(b.sent_on).getTime() - new Date(a.sent_on).getTime());

  return NextResponse.json(notifications);
}

/**
 * POST /api/notifications
 * Broadcast a new notification message and optionally send email notifications to faculty
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, recipientId, recipientRole, sendEmail } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message body is required' }, { status: 400 });
    }

    const notifId = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif = {
      notif_id: notifId,
      recipient_id: recipientId || 'ALL_FACULTY',
      message: message,
      sent_on: new Date().toISOString(),
      is_read: false,
    };

    db.notifications.set(notifId, newNotif);

    let emailDispatchResult = null;

    // Trigger email notification if requested
    if (sendEmail) {
      const emailRecipients: string[] = [];

      if (recipientId && recipientId !== 'ALL_FACULTY') {
        const fac = db.faculty.get(recipientId);
        if (fac?.email) emailRecipients.push(fac.email);
      } else {
        // Collect all faculty emails
        for (const f of db.faculty.values()) {
          if (f.email) emailRecipients.push(f.email);
        }
      }

      const emailSubject = title ? `[VJTI TTMS Alert] ${title}` : `[VJTI TTMS Alert] Faculty Notification`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
          <div style="background-color: #1e3a8a; color: white; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">VJTI TTMS: Faculty Alert</h2>
          </div>
          <p>Dear Faculty Member,</p>
          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: 500;">${message}</p>
          </div>
          <p style="margin-top: 16px; font-size: 12px; color: #64748b;">
            This is an automated notification broadcast from the VJTI Timetable Management System.
          </p>
        </div>
      `;

      emailDispatchResult = await EmailService.sendEmail({
        to: emailRecipients,
        subject: emailSubject,
        html: emailHtml,
      });
    }

    return NextResponse.json(
      {
        success: true,
        notification: newNotif,
        emailDispatch: emailDispatchResult,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Notification broadcast failed' }, { status: 500 });
  }
}
