# The Lens

> One question. Every perspective.

**The Lens** is a web tool that takes any moral, existential, or practical question and refracts it through 10 of the world's major philosophical traditions. It returns a structured, human-readable breakdown of how each school of thought would approach and answer your dilemma.

The core metaphor: a single beam of light passing through a prism, splitting into distinct, coherent perspectives. 

## 🌐 Live Demo

*(Insert Vercel Deployment URL here)*

## 🧠 Why This Exists

Most people, when facing a difficult question, only have access to one or two mental frameworks. This creates blind spots. The Lens removes that constraint. It doesn’t tell you what to think; it shows you what thinking looks like from radically different starting points, and lets you decide what resonates.

## ✨ Features

- **Stateless Architecture:** No database, no user accounts, no tracking. Total privacy.
- **Vercel Edge Functions:** Blazing fast API routing with built-in rate limiting and abuse protection.
- **Zero-Dependency Frontend:** Built entirely with Vanilla JavaScript, HTML, and CSS. No build step, no bloated framework.
- **Groq AI Integration:** Powered by Groq's insanely fast inference engine running Llama models, returning zero-fluff JSON answers in plain, non-academic language.
- **Fully Accessible:** WCAG 2.1 AA compliant, screen-reader friendly, and respects `prefers-reduced-motion`.
- **Shareable URLs:** Every query updates the URL, allowing users to share the exact question to LinkedIn or Twitter.

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JS
- **Backend:** Vercel Edge Functions (Serverless)
- **AI Engine:** Groq API (Llama 3.3)
- **Hosting & CI/CD:** Vercel
- **Version Control:** GitHub

## 🚀 Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/the-lens.git
   cd the-lens
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key
   RATE_LIMIT_MAX=5
   RATE_LIMIT_WINDOW_MS=600000
   ```

3. **Run locally:**
   Since it uses Vercel Edge Functions, the easiest way to test locally is using the Vercel CLI:
   ```bash
   npm i -g vercel
   vercel dev
   ```

## 🔒 Security & Privacy

- **API Key Protection:** The Groq API key is securely stored in Vercel environment variables and is never exposed to the client.
- **Rate Limiting:** IP-based rate limiting (5 requests / 10 minutes) protects against abuse and API cost overruns.
- **Content Security Policy (CSP):** Strict CSP headers prevent XSS and clickjacking.

## ⚖️ The 10 Traditions

- Stoicism (Ancient Greece / Rome)
- Buddhism (Ancient India / Asia)
- Existentialism (Western Modern)
- Ubuntu (African Philosophy)
- Taoism (Ancient China)
- Kantian Ethics (Western Modern)
- Utilitarianism (Western Modern)
- Confucianism (Ancient China)
- Nihilism (Western Modern)
- Advaita Vedanta (Ancient India)

---
*Built with curiosity. Powered by Claude.*
