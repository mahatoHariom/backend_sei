import { HfInference } from '@huggingface/inference'
import { injectable } from 'inversify'
import { jsonrepair } from 'jsonrepair'

interface MCQQuestion {
  question: string
  options: Array<{
    id: string
    text: string
    isCorrect: boolean
  }>
  explanation: string
}

// A robust function to extract a valid JSON substring using bracket matching.
function extractValidJson(text: string): string {
  const start = text.indexOf('[')
  if (start === -1) {
    throw new Error("No starting '[' found.")
  }
  let openCount = 0
  let end = -1
  for (let i = start; i < text.length; i++) {
    if (text[i] === '[') {
      openCount++
    } else if (text[i] === ']') {
      openCount--
      if (openCount === 0) {
        end = i
        break
      }
    }
  }
  if (end === -1) {
    throw new Error("No matching closing ']' found.")
  }
  return text.substring(start, end + 1)
}

@injectable()
export class AIService {
  private hf: HfInference

  constructor() {
    this.hf = new HfInference(process.env.HUGGING_FACE_KEY)
  }

  async generateMCQs(params: { subject: string; difficulty: string; count: number }): Promise<MCQQuestion[]> {
    const prompt = `
You are a JSON generator. You must output ONLY valid JSON and nothing else.
Generate ${params.count} original multiple choice questions for ${params.subject} at ${params.difficulty} difficulty level.
Each question must have exactly 4 options, one of which is correct, and an explanation.
Output ONLY a JSON array that exactly follows this structure (do not add any extra text):

[
  {
    "question": "Question text",
    "options": [
      { "id": "option1", "text": "Option text", "isCorrect": true/false },
      { "id": "option2", "text": "Option text", "isCorrect": true/false },
      { "id": "option3", "text": "Option text", "isCorrect": true/false },
      { "id": "option4", "text": "Option text", "isCorrect": true/false }
    ],
    "explanation": "Explanation text"
  },
  ...
]
Ensure the output is complete and ends with the closing bracket.
`

    try {
      const response = await this.hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: prompt,
        parameters: {
          max_new_tokens: 3000, // increased token limit
          return_full_text: false,
          temperature: 0.9,
          top_p: 0.95
        }
      })

      const content = response.generated_text.trim()
      console.log('Raw generated text:', content)

      if (!content) {
        throw new Error('No content received from the model')
      }

      let jsonString = extractValidJson(content)
      console.log('Extracted JSON string:', jsonString)

      try {
        // Try to parse the JSON string directly.
        const result = JSON.parse(jsonString)
        return this.validateQuestions(result)
      } catch (parseError) {
        console.warn('Direct JSON.parse failed, attempting to repair the JSON string.')
        // Attempt to repair the JSON using jsonrepair.
        const repaired = jsonrepair(jsonString)
        console.log('Repaired JSON string:', repaired)
        const result = JSON.parse(repaired)
        return this.validateQuestions(result)
      }
    } catch (error) {
      console.error('Error generating MCQs:', error)
      throw new Error('Failed to generate questions')
    }
  }

  private validateQuestions(questions: any[]): MCQQuestion[] {
    return questions.map((q, index) => ({
      question: q.question || `Question ${index + 1}`,
      options: (q.options || []).map((opt: any, optIndex: number) => ({
        id: opt.id || `opt_${index}_${optIndex}`,
        text: opt.text || `Option ${optIndex + 1}`,
        isCorrect: Boolean(opt.isCorrect)
      })),
      explanation: q.explanation || 'Explanation not available'
    }))
  }
}
