import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@ozpulse/db";
import {
  getAlertsForUser,
  markAlertRead,
  dismissAlert,
  getUnreadAlertCount,
} from "@ozpulse/db";

/**
 * GET /api/alerts?userId=<uuid>&unreadOnly=true&limit=50&layerId=<id>
 * Retrieve alerts for a user.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const unreadOnly = request.nextUrl.searchParams.get("unreadOnly") === "true";
    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    const layerId = request.nextUrl.searchParams.get("layerId") ?? undefined;

    const client = createClient();

    const [alerts, unreadCount] = await Promise.all([
      getAlertsForUser(client, userId, { unreadOnly, limit, layerId }),
      getUnreadAlertCount(client, userId),
    ]);

    return NextResponse.json({
      data: alerts,
      meta: { unreadCount, total: alerts.length },
    });
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts
 * Actions: mark-read, dismiss
 * Body: { action: "mark-read" | "dismiss", alertId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId } = body;

    if (!alertId || typeof alertId !== "string") {
      return NextResponse.json(
        { error: "alertId is required" },
        { status: 400 }
      );
    }

    if (!["mark-read", "dismiss"].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "mark-read" or "dismiss"' },
        { status: 400 }
      );
    }

    const client = createClient();

    if (action === "mark-read") {
      await markAlertRead(client, alertId);
    } else if (action === "dismiss") {
      await dismissAlert(client, alertId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/alerts error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
