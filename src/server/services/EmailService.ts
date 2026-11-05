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

    for (const recipient of recipients) {
      const normalized = recipient.toLowerCase();
      const logId = `EMAIL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      // 1. Sandbox Guard Check
      const isAllowed = ALLOWED_REAL_EMAILS.has(normalized);
      const isDummyDomain = normalized.endsWith('@dummy.ttms.local');

      if (!isAllowed || isDummyDomain) {
        // Suppress email to prevent any real faculty/user from receiving messages
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
        // Console simulation log
        console.log(`[EmailService: SANDBOX_SUPPRESSED] To: ${recipient} | Subject: "${options.subject}"`);
        continue;
      }

      // 2. Whitelisted recipient: Check SMTP configuration
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpHost && smtpUser && smtpPass) {
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
              from: options.from || process.env.SMTP_FROM || '"VJTI TTMS Alert System" <no-reply@vjti.ac.in>',
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

      // Fallback: SMTP env vars not set, record as SIMULATED
      this.outboxLogs.push({
        id: logId,
        to: recipient,
        subject: options.subject,
        html: options.html,
        text: options.text,
        status: 'SIMULATED',
        timestamp: new Date().toISOString(),
        reason: 'SMTP env vars not configured; simulated successfully',
      });
      result.sent.push(recipient);
      console.log(`[EmailService: SIMULATED] To Whitelisted: ${recipient} | Subject: "${options.subject}"`);
    }

    return result;
  }

  public static getOutboxLogs(): EmailOutboxLog[] {
    return [...this.outboxLogs];
  }

  public static clearOutboxLogs(): void {
    this.outboxLogs = [];
  }
}

