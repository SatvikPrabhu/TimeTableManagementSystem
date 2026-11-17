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

export const ALLOWED_REAL_EMAILS = new Set<string>([
  'tanishparekh03@gmail.com',
  'tanishparekh59@gmail.com',
]);

export class EmailService {
  private static outboxLogs: EmailOutboxLog[] = [];

  public static getOutboxLogs(): EmailOutboxLog[] {
    return [...this.outboxLogs];
  }

  public static clearOutboxLogs(): void {
    this.outboxLogs = [];
  }

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

      const isAllowed = ALLOWED_REAL_EMAILS.has(normalized);
      const isDummyDomain = normalized.endsWith('@dummy.ttms.local');

      if (isSandboxActive && (!isAllowed || isDummyDomain)) {
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
            : 'Blocked by Sandbox Guard: Non-whitelisted external recipient',
        };
        this.outboxLogs.push(suppressedLog);
        result.suppressed.push(recipient);
        continue;
      }

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
            continue;
          }
        } catch (err: any) {
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
    }

    return result;
  }
}
