import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Admin session terminated.' });
  response.cookies.delete('dh_admin_session');
  return response;
}
