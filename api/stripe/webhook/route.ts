import { stripe } from "@/lib/stripe"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"

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

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.client_reference_id

        const planType = subscription.items.data[0]?.price?.metadata?.plan_type || "pro"

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
        })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.client_reference_id

        await supabase.from("subscriptions").update({ plan_type: "free", status: "canceled" }).eq("user_id", userId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
