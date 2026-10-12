// scratch test for login
import { dbGetUserByEmail, dbGetAllUsers } from '../src/lib/db';
import bcrypt from 'bcryptjs';
import { signSessionToken } from '../src/lib/auth';

async function main() {
  console.log('All Users in DB:');
  console.log(dbGetAllUsers());

  const testEmail = 'mokshi@gmail.com';
  console.log('\nTesting lookup for:', testEmail);
  const user = dbGetUserByEmail(testEmail);
  console.log('Lookup result:', user);

  if (user) {
    console.log('Bcrypt compare test...');
    try {
      const match = await bcrypt.compare('12345678', user.password_hash);
      console.log('Match result:', match);
    } catch (e) {
      console.error('Bcrypt error:', e);
    }
  }

  console.log('\nTesting JWT signSessionToken...');
  try {
    const token = await signSessionToken({
      id: 'test-id',
      name: 'Test',
      email: testEmail,
      role: 'subscriber',
    });
    console.log('Token created successfully length:', token.length);
  } catch (e) {
    console.error('Token error:', e);
  }
}

main().catch(console.error);
