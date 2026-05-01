import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "dummy_key_for_build", {
  apiVersion: "2024-11-20",
})

export const SUBSCRIPTION_PLANS = {
  pro: {
    name: "Pro",
    price: 999, // $9.99 in cents
    interval: "month",
    features: [
      "Unlimited games per day",
      "Advanced analytics",
      "AI coaching sessions",
      "3 exclusive games",
      "Priority support",
    ],
  },
  elite: {
    name: "Elite",
    price: 1999, // $19.99 in cents
    interval: "month",
    features: [
      "Everything in Pro",
      "All exclusive games",
      "Tournament access",
      "Custom difficulty levels",
      "1-on-1 coaching",
      "Ad-free experience",
    ],
  },
}

export async function createCheckoutSession(userId: string, planType: "pro" | "elite") {
  const plan = SUBSCRIPTION_PLANS[planType]

  const session = await stripe.checkout.sessions.create({
    customer_email: undefined,
    client_reference_id: userId,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Brain Games ${plan.name} Plan`,
            description: plan.features.join(", "),
          },
          unit_amount: plan.price,
          recurring: {
            interval: plan.interval as "month" | "year",
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  })

  return session
}

export async function getSubscriptionStatus(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
  })

  return subscriptions.data[0] || null
}
