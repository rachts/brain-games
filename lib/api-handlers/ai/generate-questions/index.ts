import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

interface GenerateQuestionsRequest {
  gameId: string
  difficulty: number
  count: number
}

export async function POST(request: NextRequest) {
  try {
    const { gameId, difficulty, count }: GenerateQuestionsRequest = await request.json()

    const difficultyDescriptions: Record<number, string> = {
      1: "very easy, suitable for beginners",
      2: "easy, with simple patterns",
      3: "medium, requiring some thinking",
      4: "hard, with complex patterns",
      5: "very hard, requiring advanced problem-solving",
    }

    const gamePrompts: Record<string, string> = {
      memory: `Generate ${count} memory game questions at ${difficultyDescriptions[difficulty]} level. Each question should have a sequence of numbers or colors to remember. Format as JSON array with fields: sequence (array), timeToMemorize (seconds), options (array of 4 choices).`,
      speed: `Generate ${count} speed challenge questions at ${difficultyDescriptions[difficulty]} level. Each should be a quick math or pattern recognition task. Format as JSON array with fields: question (string), correctAnswer (string), options (array of 4 choices), timeLimit (seconds).`,
      logic: `Generate ${count} logic puzzle questions at ${difficultyDescriptions[difficulty]} level. Each should be a reasoning or pattern puzzle. Format as JSON array with fields: puzzle (string), correctAnswer (string), options (array of 4 choices), explanation (string).`,
      attention: `Generate ${count} attention training questions at ${difficultyDescriptions[difficulty]} level. Each should test focus and observation. Format as JSON array with fields: task (string), correctAnswer (string), options (array of 4 choices), distractors (number).`,
    }

    const prompt = gamePrompts[gameId] || gamePrompts.logic

    const { text } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `${prompt}\n\nRespond ONLY with valid JSON, no additional text.`,
      temperature: 0.7,
    })

    // Parse and validate the response
    const questions = JSON.parse(text)

    return NextResponse.json({
      success: true,
      questions: Array.isArray(questions) ? questions : [questions],
    })
  } catch (error) {
    console.error("[v0] Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}
