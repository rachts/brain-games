import { stripe } from "@/lib/stripe"
import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error("[v0] Webhook signature verification failed:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  await connectDB()

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.client_reference_id

        if (userId) {
          const planType = subscription.items.data[0]?.price?.metadata?.plan_type || "pro"
          await User.findByIdAndUpdate(userId, {
            subscriptionTier: planType,
            subscriptionStatus: subscription.status,
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.client_reference_id

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            subscriptionTier: "free",
            subscriptionStatus: "cancelled",
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
