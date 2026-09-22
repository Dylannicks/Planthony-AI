const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const contentDir = path.join(__dirname, '../content');
  const files = fs.readdirSync(contentDir).filter(f => !f.startsWith('.'));

  const chunks = [];

  for (const file of files) {
    const text = fs.readFileSync(path.join(contentDir, file), 'utf-8');
    chunks.push({ id: file, text });
  }

  const results = [];

  for (const chunk of chunks) {
    console.log(`Embedding ${chunk.id}...`);
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: chunk.text,
    });

    results.push({
      id: chunk.id,
      text: chunk.text,
      embedding: response.data[0].embedding,
    });
  }

  fs.writeFileSync(
    path.join(__dirname, '../data/embeddings.json'),
    JSON.stringify(results, null, 2)
  );

  console.log(`Done. Saved ${results.length} embeddings.`);
}

main();