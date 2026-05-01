import { NextRequest, NextResponse } from "next/server";

// Import all API handlers
import * as achievements from "@/lib/api-handlers/achievements";
import * as signup from "@/lib/api-handlers/auth/signup";
import * as logout from "@/lib/api-handlers/auth/logout";
import * as mergeData from "@/lib/api-handlers/auth/merge-data";
import * as profile from "@/lib/api-handlers/auth/profile";
import * as login from "@/lib/api-handlers/auth/login";
import * as challenges from "@/lib/api-handlers/challenges";
import * as challengeId from "@/lib/api-handlers/challenges/id";
import * as analytics from "@/lib/api-handlers/admin/analytics";
import * as scores from "@/lib/api-handlers/scores";
import * as leaderboard from "@/lib/api-handlers/leaderboard";
import * as insights from "@/lib/api-handlers/ai/insights";
import * as generateQuestions from "@/lib/api-handlers/ai/generate-questions";
import * as battleRooms from "@/lib/api-handlers/community/battle-rooms";
import * as discussions from "@/lib/api-handlers/community/discussions";
import * as communityLeaderboard from "@/lib/api-handlers/community/leaderboard";
import * as stripeWebhook from "@/lib/api-handlers/stripe/webhook";
import * as stripeCheckout from "@/lib/api-handlers/stripe/checkout";

export async function GET(req: NextRequest, { params }: { params: Promise<{ route: string[] }> | { route: string[] } }) {
  const resolvedParams = await params;
  const path = resolvedParams.route.join("/");
  
  switch (path) {
    case "achievements": return achievements.GET?.(req);
    case "auth/profile": return profile.GET?.(req);
    case "challenges": return challenges.GET?.(req);
    case "admin/analytics": return analytics.GET?.(req);
    case "scores": return scores.GET?.(req);
    case "leaderboard": return leaderboard.GET?.(req);
    case "ai/insights": return insights.GET?.(req);
    case "community/battle-rooms": return battleRooms.GET?.(req);
    case "community/discussions": return discussions.GET?.(req);
    case "community/leaderboard": return communityLeaderboard.GET?.(req);
  }
  
  if (path.startsWith("challenges/") && resolvedParams.route.length === 2) {
    return challengeId.GET?.(req, { params: { id: resolvedParams.route[1] } });
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ route: string[] }> | { route: string[] } }) {
  const resolvedParams = await params;
  const path = resolvedParams.route.join("/");
  
  switch (path) {
    case "achievements": return achievements.POST?.(req);
    case "auth/signup": return signup.POST?.(req);
    case "auth/logout": return logout.POST?.(req);
    case "auth/merge-data": return mergeData.POST?.(req);
    case "auth/login": return login.POST?.(req);
    case "challenges": return challenges.POST?.(req);
    case "scores": return scores.POST?.(req);
    case "leaderboard": return leaderboard.POST?.(req);
    case "ai/insights": return insights.POST?.(req);
    case "ai/generate-questions": return generateQuestions.POST?.(req);
    case "community/battle-rooms": return battleRooms.POST?.(req);
    case "stripe/webhook": return stripeWebhook.POST?.(req);
    case "stripe/checkout": return stripeCheckout.POST?.(req);
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ route: string[] }> | { route: string[] } }) {
  const resolvedParams = await params;
  const path = resolvedParams.route.join("/");

  if (path.startsWith("challenges/") && resolvedParams.route.length === 2) {
    return challengeId.PATCH?.(req, { params: { id: resolvedParams.route[1] } });
  }

  return NextResponse.json({ error: "Not Found" }, { status: 404 });
}
