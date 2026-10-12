import { NextResponse } from 'next/server';
import { sendAuthNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Disable completely in production for security!
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const rawTelegramToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const rawTelegramChatId = process.env.TELEGRAM_CHAT_ID?.trim();
  const rawResendKey = process.env.RESEND_API_KEY?.trim();
  const rawNotificationEmail = process.env.NOTIFICATION_EMAIL?.trim();

  const telegramConfigured = Boolean(rawTelegramToken && rawTelegramChatId);
  const emailConfigured = Boolean(rawResendKey && rawNotificationEmail);

  await sendAuthNotification({
    event: 'LOGIN',
    name: 'Notification Test User',
    email: 'test@digitalheroes.dev',
    ip: '127.0.0.1',
    details: 'Development notification channel test',
  });

  return NextResponse.json({
    success: true,
    message: 'Test notification triggered.',
    configuration: {
      telegram: telegramConfigured ? 'Configured' : 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID',
      email: emailConfigured ? 'Configured' : 'Missing RESEND_API_KEY or NOTIFICATION_EMAIL',
    },
  });
}
