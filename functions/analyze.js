import fetch from "node-fetch";

export async function handler(event) {
  const { text } = JSON.parse(event.body);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an empathetic AI assistant. Return ONLY JSON with emotion, empathetic_response, main_action, micro_task_5min." },
        { role: "user", content: `User says: ${text}` }
      ]
    })
  });

  const data = await response.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data.choices[0].message.content)
  };
}