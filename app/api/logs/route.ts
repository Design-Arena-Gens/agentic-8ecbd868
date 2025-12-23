import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const logFile = path.join(process.cwd(), 'logs', 'automation.log');

    if (!fs.existsSync(logFile)) {
      return NextResponse.json({ logs: [] });
    }

    const logContent = fs.readFileSync(logFile, 'utf-8');
    const logs = logContent
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line))
      .reverse()
      .slice(0, 20); // Last 20 logs

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, logs: [] },
      { status: 500 }
    );
  }
}
