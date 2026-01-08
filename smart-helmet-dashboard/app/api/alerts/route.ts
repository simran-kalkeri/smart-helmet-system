import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const logPath = path.join(process.cwd(), '..', 'helmet-server', 'logs', 'accidents.json');

        if (!fs.existsSync(logPath)) {
            return NextResponse.json([]);
        }

        const data = fs.readFileSync(logPath, 'utf-8');
        const accidents = JSON.parse(data);

        // Format alerts
        const alerts = accidents.map((acc: any, index: number) => {
            const timestamp = new Date(acc.timestamp);
            const now = new Date();
            const hoursSince = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

            return {
                id: acc.id || `alert-${Date.now()}-${index}`,
                riderName: "Simran Kalkeri",
                helmetId: acc.helmetId || "H001",
                timestamp: timestamp.toLocaleString(),
                timestampMs: acc.timestamp,
                location: acc.location
                    ? `${acc.location.latitude.toFixed(4)}, ${acc.location.longitude.toFixed(4)}`
                    : "Unknown",
                latitude: acc.location?.latitude?.toString() || "0",
                longitude: acc.location?.longitude?.toString() || "0",
                severity: acc.severity || "high",
                isCancelled: acc.isCancelled || false,
                isActive: hoursSince < 24
            };
        });

        // SORT: Newest first (highest timestamp at top)
        alerts.sort((a: any, b: any) => b.timestampMs - a.timestampMs);

        console.log(`[Alerts API] Returning ${alerts.length} alerts, newest first`);
        if (alerts.length > 0) {
            console.log(`  First alert timestamp: ${alerts[0].timestamp}`);
            console.log(`  Last alert timestamp: ${alerts[alerts.length - 1].timestamp}`);
        }

        // No cache to ensure fresh data
        return new NextResponse(JSON.stringify(alerts), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate'
            }
        });
    } catch (error) {
        console.error('Error reading alerts:', error);
        return NextResponse.json([]);
    }
}
