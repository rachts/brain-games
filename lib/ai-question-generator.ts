import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getCachedOrGenerateQuestions(gameId: string, difficulty: number, count = 5) {
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

  // Try to get cached questions
  const { data: cachedQuestions } = await supabase
    .from("generated_questions")
    .select("question_data")
    .eq("game_id", gameId)
    .eq("difficulty_level", difficulty)
    .gt("expires_at", new Date().toISOString())
    .limit(count)

  if (cachedQuestions && cachedQuestions.length >= count) {
    return cachedQuestions.map((q) => q.question_data)
  }

  // Generate new questions via API
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/ai/generate-questions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, difficulty, count }),
    },
  )

  const { questions } = await response.json()

  // Cache the generated questions
  for (const question of questions) {
    await supabase.from("generated_questions").insert({
      game_id: gameId,
      difficulty_level: difficulty,
      question_data: question,
    })
  }

  return questions
}
