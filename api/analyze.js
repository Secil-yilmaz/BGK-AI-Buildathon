import OpenAI from "openai";

export async function handler(event, context) {
  const { text } = JSON.parse(event.body);

  const client = new OpenAI({ apiKey: process.env.VITE_OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are an empathetic AI assistant.
Analyze the user's exact emotional state.
Return ONLY JSON like:

{
  "emotion": "...",
  "empathetic_response": "...",
  "main_action": "...",
  "micro_task_5min": "..."
}`
      },
      {
        role: "user",
        content: text
      }
    ]
  });

  return {
    statusCode: 200,
    body: JSON.stringify(completion.choices[0].message.content)
  };
}