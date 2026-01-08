import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const logPath = path.join(process.cwd(), '..', 'helmet-server', 'logs', 'accidents.json');

        if (!fs.existsSync(logPath)) {
            return NextResponse.json({
                success: true,
                accidents: [],
                stats: { total: 0, highSeverity: 0, lowSeverity: 0, falseAlarms: 0, confirmed: 0 }
            });
        }

        const data = fs.readFileSync(logPath, 'utf-8');
        const accidents = JSON.parse(data);

        const stats = {
            total: accidents.length,
            highSeverity: accidents.filter((a: any) => a.severity === 'high').length,
            lowSeverity: accidents.filter((a: any) => a.severity === 'low').length,
            falseAlarms: accidents.filter((a: any) => a.isCancelled === true).length,
            confirmed: accidents.filter((a: any) => a.isCancelled === false).length
        };

        return NextResponse.json({ success: true, accidents, stats });
    } catch (error) {
        console.error('Error reading accidents:', error);
        return NextResponse.json({
            success: false,
            accidents: [],
            stats: { total: 0, highSeverity: 0, lowSeverity: 0, falseAlarms: 0, confirmed: 0 }
        });
    }
}
