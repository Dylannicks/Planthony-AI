# 🌱 Planthony — AI Plant Care Chatbot

Planthony is a retrieval-augmented generation (RAG) chatbot built for [Plant Parenthood](https://theplantparenthoodstore.com), a botanical e-commerce business. It answers customer questions about plant care and product selection using the company's own care guides and catalog data, and embeds directly into the site as a floating chat widget.

## How it works

Rather than fine-tuning a model, Planthony uses a lightweight RAG pipeline:

1. **Knowledge base** — plant care guides, product info, and company FAQs are stored as plain text.
2. **Embeddings** — each document is converted into a vector using OpenAI's `text-embedding-3-small` model and cached locally as JSON (no external vector database needed at this scale).
3. **Retrieval** — when a user asks a question, their message is embedded and compared against the knowledge base using cosine similarity to find the most relevant content.
4. **Generation** — the top matches are passed as context to `gpt-4o-mini`, which generates a grounded, on-topic answer.
5. **Delivery** — the chat UI is served as a Next.js page and embedded into the Squarespace site via an iframe inside a floating widget.

## Tech stack

- **Next.js** (App Router) — frontend and API routes
- **OpenAI API** — `text-embedding-3-small` for embeddings, `gpt-4o-mini` for chat completions
- **Vercel** — hosting and deployment
- **Vanilla JS/CSS** — embeddable floating widget for Squarespace

## Project structure

```
plant-chatbot/
├── app/
│   ├── api/chat/route.js     # Retrieval + chat API endpoint
│   └── widget/page.js        # Chat UI (served standalone, embedded via iframe)
├── content/                  # Source knowledge base (care guides, product info, FAQs)
├── data/embeddings.json      # Precomputed embeddings for the knowledge base
├── scripts/generate-embeddings.js   # One-time script to (re)generate embeddings
└── .env.local                # Local environment variables (not committed)
```

## Running locally

1. Clone the repo and install dependencies:
   \```bash
   npm install
   \```
2. Add your OpenAI API key to a `.env.local` file:
   \```
   OPENAI_API_KEY=sk-your-key-here
   \```
3. (Re)generate embeddings if you've changed anything in `content/`:
   \```bash
   node scripts/generate-embeddings.js
   \```
4. Start the dev server:
   \```bash
   npm run dev
   \```
5. Visit `http://localhost:3000/widget` to test the chat interface.

## Deployment

The app is deployed on Vercel. Environment variables (`OPENAI_API_KEY`) are set in the Vercel project settings rather than committed to the repo. Pushing to `main` triggers an automatic redeploy.

## Embedding on a live site

The deployed `/widget` route is embedded into Squarespace as a floating chat bubble via a small script injected in **Settings → Advanced → Code Injection → Footer**, which loads the widget in an iframe and toggles its visibility.

## Updating the knowledge base

To add or edit what Planthony knows:
1. Add or edit a text file in `content/`
2. Re-run `node scripts/generate-embeddings.js` to regenerate `data/embeddings.json`
3. Commit and push — Vercel will redeploy automatically

## Possible future improvements

- Chunk large content files by topic (per plant/product) for more precise retrieval as the catalog grows
- Add conversation memory across multiple turns
- Track usage/analytics on common questions to identify gaps in the knowledge base
- Swap the in-memory JSON store for a real vector database if the content library scales significantly

---

Built by [Dylan Nicks](https://www.linkedin.com/in/dylan-nicks) for Plant Parenthood.
