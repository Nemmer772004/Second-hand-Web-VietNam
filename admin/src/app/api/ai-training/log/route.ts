import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

type LogEntry = {
  timestamp: string;
  level: string;
  message: string;
};

const MAX_ENTRIES = 100;

async function resolveLogPath(): Promise<string | null> {
  const candidates = [
    process.env.AI_TRAINING_LOG_PATH,
    path.resolve(process.cwd(), '../ai-agent/log/retrain.log'),
    path.resolve(process.cwd(), '../../ai-agent/log/retrain.log'),
    path.resolve(process.cwd(), '../../../ai-agent/log/retrain.log'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }

  return null;
}

function parseLine(line: string): LogEntry {
  const parts = line.split('|').map((segment) => segment.trim());
  const timestamp = parts[0] ?? '';
  const level = (parts[1] ?? 'INFO').replace(/\s+/g, ' ');
  const message = parts.slice(2).join(' | ');
  return { timestamp, level, message };
}

export async function GET() {
  try {
    const logPath = await resolveLogPath();
    if (!logPath) {
      return NextResponse.json([], {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const content = await fs.readFile(logPath, 'utf8');
    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const entries = lines
      .slice(-MAX_ENTRIES)
      .reverse()
      .map(parseLine);

    return NextResponse.json(entries, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.warn('Không thể đọc log huấn luyện:', error);
    return NextResponse.json([], {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
