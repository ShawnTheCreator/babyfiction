import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

async function ensureConnection() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not set in environment');
  await mongoose.connect(uri, { autoIndex: true });
}

async function upsertUser({ firstName, lastName, email, password, role }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ firstName, lastName, email, password, role, isEmailVerified: true });
    return { user, created: true };
  }
  if (role && user.role !== role) {
    user.role = role;
    await user.save();
  }
  return { user, created: false };
}

async function run() {
  await ensureConnection();

  const results = [];
  results.push(await upsertUser({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@example.com',
    password: 'ChangeMe123!',
    role: 'admin',
  }));

  results.push(await upsertUser({
    firstName: 'Test',
    lastName: 'Customer',
    email: 'customer@example.com',
    password: 'ChangeMe123!',
    role: 'customer',
  }));

  results.push(await upsertUser({
    firstName: 'John',
    lastName: 'Driver',
    email: 'driver@example.com',
    password: 'ChangeMe123!',
    role: 'driver',
    phone: '+27812345678',
  }));

  for (const r of results) {
    const { user, created } = r;
    console.log(`${created ? 'Created' : 'Ensured'} user: ${user.email} (role=${user.role})`);
  }

  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
