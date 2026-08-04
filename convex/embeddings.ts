const EMBEDDING_MODEL = "text-embedding-3-small";

export async function createEmbedding(input: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key is missing");

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input,
      encoding_format: "float",
    }),
  });
  if (!response.ok) throw new Error(`Embedding generation failed: ${response.status}`);

  const body = (await response.json()) as {
    data?: Array<{ embedding?: unknown }>;
  };
  const embedding = body.data?.[0]?.embedding;
  if (
    !Array.isArray(embedding) ||
    embedding.length === 0 ||
    !embedding.every((value) => typeof value === "number" && Number.isFinite(value))
  )
    throw new Error("Embedding response is invalid");
  return embedding as number[];
}

export function cosineSimilarity(left: number[], right: number[]) {
  if (left.length !== right.length || left.length === 0) return -1;
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;
  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftMagnitude += leftValue * leftValue;
    rightMagnitude += rightValue * rightValue;
  }
  const magnitude = Math.sqrt(leftMagnitude * rightMagnitude);
  return magnitude === 0 ? -1 : dot / magnitude;
}
