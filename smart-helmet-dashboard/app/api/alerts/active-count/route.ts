import { NextResponse } from "next/server";
import { getActiveAlertsCount } from "@/lib/accidents-store";

export async function GET() {
    const activeCount = getActiveAlertsCount();
    return NextResponse.json({ count: activeCount });
}
