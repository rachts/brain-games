"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export default function PricingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  async function handleSubscribe(plan: "pro" | "elite") {
    if (!user) {
      window.location.href = "/login"
      return
    }

    setLoading(plan)
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const { sessionId } = await response.json()
      window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
    } catch (error) {
      console.error("[v0] Error creating checkout session:", error)
    } finally {
      setLoading(null)
    }
  }

  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for getting started",
      features: [
        "5 games per day",
        "Basic analytics",
        "Difficulty levels 1-3",
        "Global leaderboard",
        "Community access",
      ],
      cta: "Current Plan",
      disabled: true,
    },
    {
      name: "Pro",
      price: "9.99",
      description: "For serious brain trainers",
      features: [
        "Unlimited games per day",
        "Advanced analytics",
        "All difficulty levels",
        "AI coaching sessions",
        "3 exclusive games",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      onClick: () => handleSubscribe("pro"),
      loading: loading === "pro",
      highlighted: true,
    },
    {
      name: "Elite",
      price: "19.99",
      description: "For competitive players",
      features: [
        "Everything in Pro",
        "All exclusive games",
        "Tournament access",
        "Custom difficulty levels",
        "1-on-1 coaching",
        "Ad-free experience",
      ],
      cta: "Upgrade to Elite",
      onClick: () => handleSubscribe("elite"),
      loading: loading === "elite",
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold gradient-text">Simple, Transparent Pricing</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose the perfect plan to enhance your cognitive abilities
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`glass p-8 flex flex-col transition-smooth ${
                    plan.highlighted ? "ring-2 ring-primary scale-105" : ""
                  }`}
                >
                  {plan.highlighted && <Badge className="w-fit mb-4">Most Popular</Badge>}

                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <Button
                    onClick={plan.onClick}
                    disabled={plan.disabled || plan.loading}
                    className="w-full mb-8"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.loading ? "Processing..." : plan.cta}
                  </Button>

                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-primary">✓</span>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  {
                    q: "Can I cancel anytime?",
                    a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
                  },
                  {
                    q: "Is there a free trial?",
                    a: "The Free plan gives you full access to core features. Upgrade to Pro or Elite anytime to unlock premium content.",
                  },
                  {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit cards, debit cards, and digital payment methods through Stripe.",
                  },
                ].map((faq, i) => (
                  <Card key={i} className="glass p-6">
                    <h4 className="font-semibold mb-2">{faq.q}</h4>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
