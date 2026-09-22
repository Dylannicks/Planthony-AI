import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load embeddings once (cached across requests in the same server instance)
const embeddingsPath = path.join(process.cwd(), 'data/embeddings.json');
const knowledgeBase = JSON.parse(fs.readFileSync(embeddingsPath, 'utf-8'));

function cosineSimilarity(a, b) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json({ error: 'No message provided' }, { status: 400 });
    }

    // 1. Embed the user's question
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: message,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // 2. Score every chunk by similarity to the question
    const scored = knowledgeBase.map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));

    // 3. Take the top matches (all 4 files, so top 2 is reasonable; adjust as needed)
    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, 2);

    const context = topChunks.map((c) => c.text).join('\n\n---\n\n');

    // 4. Ask gpt-4o-mini to answer using that context
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful plant care assistant for Plant Parenthood, a plant shop. Answer customer questions using ONLY the information below. If the answer isn't in the information provided, say you're not sure and suggest they contact the shop directly. Keep answers friendly and concise.

Information:
${context}`,
        },
        { role: 'user', content: message },
      ],
    });

    const answer = chatResponse.choices[0].message.content;

    return Response.json({ answer });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}