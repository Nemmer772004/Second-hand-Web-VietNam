import { NextResponse } from 'next/server';
import fs from 'fs';
import { promises as fsp } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const OUTPUT_LIMIT = 4000;

function trimOutputLines(lines: string[]): string[] {
  if (lines.join('').length <= OUTPUT_LIMIT) {
    return lines;
  }
  const truncated = lines.join('');
  return [truncated.slice(-OUTPUT_LIMIT)];
}

async function resolveAgentDir(): Promise<string> {
  const candidates = [
    process.env.AI_AGENT_DIR,
    path.resolve(process.cwd(), '../ai-agent'),
    path.resolve(process.cwd(), '../../ai-agent'),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const stat = await fsp.stat(candidate);
      if (stat.isDirectory()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  throw new Error('Không tìm thấy thư mục ai-agent.');
}

async function resolvePython(agentDir: string): Promise<string> {
  const candidates = [
    process.env.AI_AGENT_PYTHON,
    path.join(agentDir, 'venv/bin/python'),
    'python3',
    'python',
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (candidate.includes('/') || candidate.includes('\\')) {
      try {
        await fsp.access(candidate, fs.constants.X_OK);
        return candidate;
      } catch {
        continue;
      }
    } else {
      return candidate;
    }
  }

  throw new Error('Không tìm thấy Python phù hợp để chạy retrain.');
}

export async function POST() {
  try {
    const agentDir = await resolveAgentDir();
    const scriptPath = path.join(agentDir, 'tasks/retrain.py');

    await fsp.access(scriptPath);

    const pythonPath = await resolvePython(agentDir);

    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(pythonPath, [scriptPath], {
        cwd: agentDir,
    env: process.env,
  });

      proc.stdout.on('data', (data: Buffer) => {
        stdoutChunks.push(data.toString());
      });

      proc.stderr.on('data', (data: Buffer) => {
        stderrChunks.push(data.toString());
      });

      proc.on('error', (error) => reject(error));

      proc.on('close', (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        const error = new Error(
          `Retrain script exited with code ${code}: ${stderrChunks.join('')}`,
        ) as Error & { exitCode?: number };
        error.exitCode = typeof code === 'number' ? code : undefined;
        reject(error);
      });
    });

    return NextResponse.json({
      message: 'Huấn luyện hoàn tất.',
      output: trimOutputLines(stdoutChunks),
      errorOutput: trimOutputLines(stderrChunks),
    });
  } catch (error) {
    console.error('Retrain trigger failed:', error);
    return NextResponse.json(
      {
        message:
          (error as Error & { exitCode?: number })?.exitCode === 2
            ? 'Đang có một tiến trình huấn luyện khác chạy. Vui lòng thử lại sau.'
            : error instanceof Error
            ? error.message
            : 'Huấn luyện thất bại.',
      },
      { status: (error as Error & { exitCode?: number })?.exitCode === 2 ? 409 : 500 },
    );
  }
}
