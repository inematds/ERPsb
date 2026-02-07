import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const status: {
    status: string;
    timestamp: string;
    database: string;
    version: string;
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'disconnected',
    version: '0.1.0',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = 'connected';
  } catch {
    status.database = 'disconnected';
    status.status = 'degraded';
  }

  const httpStatus = status.status === 'ok' ? 200 : 503;
  return NextResponse.json(status, { status: httpStatus });
}
