import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@ozpulse/db";
import { getUserProfile, upsertUserProfile, updateUserProfile } from "@ozpulse/db";

/**
 * GET /api/profile?userId=<uuid>
 * Retrieve the current user's profile.
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

    const client = createClient();
    const profile = await getUserProfile(client, userId);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Create or update a user profile.
 * Body: { userId?: string, ...profile fields }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!profileData.postcode || !/^\d{4}$/.test(profileData.postcode)) {
      return NextResponse.json(
        { error: "Valid 4-digit Australian postcode is required" },
        { status: 400 }
      );
    }

    const client = createClient();

    let profile;
    if (userId) {
      // Update existing profile
      const existing = await getUserProfile(client, userId);
      if (existing) {
        profile = await updateUserProfile(client, userId, profileData);
      } else {
        profile = await upsertUserProfile(client, {
          id: userId,
          ...profileData,
        });
      }
    } else {
      // Create new profile
      profile = await upsertUserProfile(client, profileData);
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
