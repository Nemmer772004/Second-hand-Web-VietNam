import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const STATUS_CANDIDATES = [
  process.env.AI_TRAINING_STATUS_PATH,
  path.resolve(process.cwd(), '../ai-agent/log/retrain_status.json'),
  path.resolve(process.cwd(), '../../ai-agent/log/retrain_status.json'),
  path.resolve(process.cwd(), '../../../ai-agent/log/retrain_status.json'),
].filter(Boolean) as string[];

async function resolveStatusPath(): Promise<string | null> {
  for (const candidate of STATUS_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

export async function GET() {
  try {
    const statusPath = await resolveStatusPath();
    if (!statusPath) {
      return NextResponse.json(
        { status: 'unknown', message: 'Không tìm thấy file trạng thái retrain.' },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const raw = await fs.readFile(statusPath, 'utf8');
    const payload = JSON.parse(raw);

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.warn('Không thể đọc trạng thái retrain:', error);
    return NextResponse.json(
      { status: 'error', message: 'Không thể tải trạng thái retrain.' },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
