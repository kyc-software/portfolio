export async function createSpeech(input: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key is missing");

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "marin",
      input,
      instructions: "Speak naturally, warmly, and concisely.",
      response_format: "mp3",
    }),
  });

  if (!response.ok) throw new Error(`Speech generation failed: ${response.status}`);
  return new Blob([await response.arrayBuffer()], { type: "audio/mpeg" });
}
