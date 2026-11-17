// =============================================================================
// VJTI Time Table Management System (TTMS)
// EmailService: Centralized Dispatcher & Sandbox Whitelist Guard
// Guarantees zero accidental emails to real institutional faculty addresses.
// =============================================================================

export interface EmailOutboxLog {
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  status: 'SENT' | 'SIMULATED' | 'SANDBOX_SUPPRESSED' | 'FAILED';
  timestamp: string;
  reason?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

// STRICT HARDCODED SANDBOX WHITELIST GUARD
export const ALLOWED_REAL_EMAILS = new Set<string>([
  'tanishparekh03@gmail.com', // PMC Faculty Test Recipient
  'tanishparekh59@gmail.com', // Student Test Recipient
]);

export class EmailService {
  private static outboxLogs: EmailOutboxLog[] = [];

  /**
   * Returns current outbox logs
   */
  public static getOutboxLogs(): EmailOutboxLog[] {
    return [...this.outboxLogs];
  }

  /**
   * Dispatches email or safely suppresses it according to whitelist rules.
   */
  public static async sendEmail(options: SendEmailOptions): Promise<{
    sent: string[];
    suppressed: string[];
    failed: string[];
  }> {
    const recipients = Array.isArray(options.to)
      ? options.to.map((e) => e.trim()).filter(Boolean)
      : options.to.split(',').map((e) => e.trim()).filter(Boolean);

    const result = {
      sent: [] as string[],
      suppressed: [] as string[],
      failed: [] as string[],
    };

    const isSandboxActive = process.env.ENABLE_EMAIL_SANDBOX !== 'false';

    for (const recipient of recipients) {
      const normalized = recipient.toLowerCase();
      const logId = `EMAIL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // 1. Sandbox Guard Check
      const isAllowed = ALLOWED_REAL_EMAILS.has(normalized);
      const isDummyDomain = normalized.endsWith('@dummy.ttms.local');

      // If sandbox is active and email is not explicitly in test whitelist (or is a dummy local address)
      if (isSandboxActive && (!isAllowed || isDummyDomain)) {
        // Suppress email to prevent any real faculty/user from receiving unexpected messages
        const suppressedLog: EmailOutboxLog = {
          id: logId,
          to: recipient,
          subject: options.subject,
          html: options.html,
          text: options.text,
          status: 'SANDBOX_SUPPRESSED',
          timestamp: new Date().toISOString(),
          reason: isDummyDomain
            ? 'Blocked by Sandbox Guard: Dummy domain recipient (@dummy.ttms.local)'
            : 'Blocked by Sandbox Guard: Non-whitelisted external recipient (Set ENABLE_EMAIL_SANDBOX=false in .env to disable)',
        };
        this.outboxLogs.push(suppressedLog);
        result.suppressed.push(recipient);
        // Console simulation log
        console.log(`[EmailService: SANDBOX_SUPPRESSED] To: ${recipient} | Subject: "${options.subject}"`);
        continue;
      }

      // 2. Check SMTP configuration
      const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      const isPlaceholderConfig =
        !smtpUser ||
        !smtpPass ||
        smtpUser.includes('PLACEHOLDER') ||
        smtpPass.includes('PLACEHOLDER');

      if (!isPlaceholderConfig && smtpHost && smtpUser && smtpPass) {
        try {
          // Attempt real Nodemailer dispatch
          let nodemailer: any;
          try {
            nodemailer = require('nodemailer');
          } catch {
            nodemailer = null;
          }

          if (nodemailer) {
            const transporter = nodemailer.createTransport({
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            });

            await transporter.sendMail({
              from: options.from || process.env.SMTP_FROM || `"VJTI TTMS Alert System" <${smtpUser}>`,
              to: recipient,
              subject: options.subject,
              text: options.text,
              html: options.html,
            });

            this.outboxLogs.push({
              id: logId,
              to: recipient,
              subject: options.subject,
              html: options.html,
              text: options.text,
              status: 'SENT',
              timestamp: new Date().toISOString(),
            });
            result.sent.push(recipient);
            console.log(`[EmailService: SENT] Successfully dispatched to ${recipient}`);
            continue;
          }
        } catch (err: any) {
          console.error(`[EmailService: FAILED] Error dispatching to ${recipient}:`, err?.message || err);
          this.outboxLogs.push({
            id: logId,
            to: recipient,
            subject: options.subject,
            html: options.html,
            text: options.text,
            status: 'FAILED',
            timestamp: new Date().toISOString(),
            reason: err?.message || 'SMTP dispatch error',
          });
          result.failed.push(recipient);
          continue;
        }
      }

      // Fallback: SMTP credentials not provided or placeholder, record as SIMULATED
      this.outboxLogs.push({
        id: logId,
        to: recipient,
        subject: options.subject,
        html: options.html,
        text: options.text,
        status: 'SIMULATED',
        timestamp: new Date().toISOString(),
        reason: isPlaceholderConfig
          ? 'Placeholder SMTP credentials in .env; email simulated safely.'
          : 'SMTP env vars not configured; simulated successfully.',
      });
      result.sent.push(recipient);
      console.log(`[EmailService: SIMULATED] To: ${recipient} | Subject: "${options.subject}"`);
    }

    return result;
  }
}
