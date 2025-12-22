import { NextResponse } from "next/server";
import { getAlerts } from "@/lib/accidents-store";

export async function GET() {
    const alerts = getAlerts();
    return NextResponse.json(alerts);
}
