import 'server-only';

export type AuthNotificationEvent =
  | 'SIGNUP'
  | 'LOGIN'
  | 'LOGOUT'
  | 'ADMIN_LOGIN'
  | 'FAILED_LOGIN';

export interface SendAuthNotificationParams {
  event: AuthNotificationEvent;
  name: string;
  email: string;
  ip?: string;
  userAgent?: string;
  details?: string;
}

/**
 * Format current timestamp for notification messages
 */
function getFormattedTimestamp(): string {
  return new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
    timeZone: 'UTC',
  }) + ' (UTC)';
}

/**
 * Internal Telegram Sender
 */
async function sendTelegramNotificationInternal(params: SendAuthNotificationParams): Promise<void> {
  try {
    const rawToken = process.env.TELEGRAM_BOT_TOKEN?.trim().replace(/^["']|["']$/g, '');
    const chatId = process.env.TELEGRAM_CHAT_ID?.trim().replace(/^["']|["']$/g, '');

    if (!rawToken || !chatId) {
      console.warn('[Notifications] Telegram skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing.');
      return;
    }

    const botToken = rawToken.startsWith('bot') ? rawToken.slice(3) : rawToken;
    const timeStr = getFormattedTimestamp();
    const ipStr = params.ip && params.ip !== 'Unknown' ? params.ip : 'Client Session';

    let header = '🔐 AUTHENTICATION EVENT';
    if (params.event === 'SIGNUP') header = '🆕 NEW USER SIGNUP';
    if (params.event === 'LOGOUT') header = '🚪 USER LOGOUT';
    if (params.event === 'ADMIN_LOGIN') header = '🔐 ADMIN LOGIN';
    if (params.event === 'FAILED_LOGIN') header = '⚠️ FAILED LOGIN ATTEMPT';

    const messageLines = [
      header,
      '',
      `Event: ${params.event}`,
      `Name: ${params.name}`,
      `Email: ${params.email}`,
      `Time: ${timeStr}`,
      `IP: ${ipStr}`,
    ];

    if (params.details) {
      messageLines.push(`Details: ${params.details}`);
    }

    const message = messageLines.join('\n');
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      console.log('[Notifications] Telegram notification sent successfully.');
    } else {
      const errText = await res.text();
      console.error(`[Notifications] Telegram failed: HTTP ${res.status} - ${errText}`);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.error('[Notifications] Telegram failed: Request timed out after 1500ms.');
    } else {
      console.error('[Notifications] Telegram failed:', err?.message || err);
    }
  }
}

/**
 * Internal Resend REST API Email Sender
 */
async function sendEmailNotificationInternal(params: SendAuthNotificationParams): Promise<void> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, '');
    const toEmail = process.env.NOTIFICATION_EMAIL?.trim().replace(/^["']|["']$/g, '');
    const fromEmail =
      process.env.NOTIFICATION_FROM_EMAIL?.trim().replace(/^["']|["']$/g, '') ||
      'Digital Heroes <onboarding@resend.dev>';

    if (!resendApiKey || !toEmail) {
      console.warn('[Notifications] Email skipped: RESEND_API_KEY or NOTIFICATION_EMAIL missing.');
      return;
    }

    const timeStr = getFormattedTimestamp();
    let subject = `User Event - ${params.event} (${params.email})`;
    if (params.event === 'SIGNUP') subject = `New User Signup - Digital Heroes`;
    if (params.event === 'LOGIN') subject = `User Login - Digital Heroes`;
    if (params.event === 'LOGOUT') subject = `User Logout - Digital Heroes`;
    if (params.event === 'ADMIN_LOGIN') subject = `Admin Login - Digital Heroes`;
    if (params.event === 'FAILED_LOGIN') subject = `Security Alert: Failed Login - Digital Heroes`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0e14; color: #e2e8f0; margin: 0; padding: 24px; }
    .card { background-color: #121824; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; max-width: 500px; margin: 0 auto; }
    .badge { display: inline-block; background-color: #f97316; color: #ffffff; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
    h2 { color: #ffffff; margin-top: 12px; margin-bottom: 20px; font-size: 20px; }
    .field { margin-bottom: 10px; font-size: 14px; }
    .label { color: #94a3b8; font-weight: 600; width: 80px; display: inline-block; }
    .value { color: #f8fafc; font-weight: 500; }
    .footer { margin-top: 24px; pt: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">${params.event}</span>
    <h2>Digital Heroes Authentication Alert</h2>
    <div class="field"><span class="label">Event:</span> <span class="value">${params.event}</span></div>
    <div class="field"><span class="label">Name:</span> <span class="value">${params.name}</span></div>
    <div class="field"><span class="label">Email:</span> <span class="value">${params.email}</span></div>
    <div class="field"><span class="label">Time:</span> <span class="value">${timeStr}</span></div>
    <div class="field"><span class="label">IP Address:</span> <span class="value">${params.ip || 'Unknown'}</span></div>
    ${params.details ? `<div class="field"><span class="label">Details:</span> <span class="value">${params.details}</span></div>` : ''}
    <div class="footer">
      This is an automated security notification from Digital Heroes.
    </div>
  </div>
</body>
</html>
    `.trim();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html: htmlContent,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      console.log('[Notifications] Email notification sent successfully.');
    } else {
      const errText = await res.text();
      console.error(`[Notifications] Email failed: HTTP ${res.status} - ${errText}`);
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.error('[Notifications] Email failed: Request timed out after 1500ms.');
    } else {
      console.error('[Notifications] Email failed:', err?.message || err);
    }
  }
}

/**
 * Primary Server-Side Reusable Notification Function
 * Dispatches both Telegram and Resend Email alerts asynchronously in background.
 * Guaranteed non-blocking - will NEVER delay or block user HTTP API responses.
 */
export async function sendAuthNotification(params: SendAuthNotificationParams): Promise<void> {
  // Fire and forget asynchronously
  Promise.allSettled([
    sendTelegramNotificationInternal(params),
    sendEmailNotificationInternal(params),
  ]).catch(() => {});
}
