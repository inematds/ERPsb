import { NextResponse } from 'next/server';
import { basePrisma } from '@/lib/prisma';

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check 1: ENV vars
  checks.hasEnableDevLogin = process.env.ENABLE_DEV_LOGIN;
  checks.nodeEnv = process.env.NODE_ENV;
  checks.hasDbUrl = !!process.env.DATABASE_URL;
  checks.dbUrlPort = process.env.DATABASE_URL?.match(/:(\d+)\//)?.[1] ?? 'unknown';
  checks.hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  checks.nextAuthUrl = process.env.NEXTAUTH_URL;

  // Check 2: DB connection
  try {
    const result = await basePrisma.$queryRaw`SELECT 1 as ok`;
    checks.dbConnection = 'OK';
    checks.dbResult = result;
  } catch (e) {
    checks.dbConnection = 'FAILED';
    checks.dbError = e instanceof Error ? e.message : String(e);
  }

  // Check 3: Can create/find user
  try {
    const user = await basePrisma.user.findFirst({ take: 1 });
    checks.userQuery = 'OK';
    checks.userCount = user ? 'has users' : 'no users';
  } catch (e) {
    checks.userQuery = 'FAILED';
    checks.userError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(checks);
}
