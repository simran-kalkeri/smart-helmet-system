import { NextResponse } from "next/server";
import { getNotifications } from "@/lib/accidents-store";

export async function GET() {
    const notifications = getNotifications();
    return NextResponse.json(notifications);
}
