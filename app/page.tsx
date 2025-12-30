import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-card to-background">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-5xl sm:text-7xl font-bold gradient-text text-balance">
              Train Your Mind, Enhance Your Skills
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Engage in scientifically-designed brain games to improve memory, speed, logic, and attention. Track your
              progress and compete with others.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Play as Guest
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">Why Brain Games?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Memory Master",
                description: "Strengthen your memory with engaging pattern recognition games",
                icon: "🧠",
              },
              {
                title: "Speed Challenge",
                description: "Test your reaction time and processing speed",
                icon: "⚡",
              },
              {
                title: "Logic Puzzles",
                description: "Solve complex puzzles to enhance problem-solving skills",
                icon: "🎯",
              },
              {
                title: "Attention Training",
                description: "Improve focus and concentration with targeted exercises",
                icon: "👁️",
              },
              {
                title: "Progress Tracking",
                description: "Monitor your improvement with detailed analytics",
                icon: "📊",
              },
              {
                title: "Leaderboards",
                description: "Compete with friends and players worldwide",
                icon: "🏆",
              },
            ].map((feature, i) => (
              <div key={i} className="glass p-6 rounded-xl hover:bg-card/60 transition-smooth">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="glass p-12 rounded-2xl text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Challenge Your Brain?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of players improving their cognitive abilities every day.
            </p>
            <Link href="/signup">
              <Button size="lg">Start Playing Now</Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
