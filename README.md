# ExoTube - YouTube Automation Studio

ExoTube is a production-ready YouTube Automation SaaS designed to generate viral video scripts, clickable high-CTR titles, optimized SEO descriptions, and keyword tags in under 10 seconds.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add your API Key**:
   Create a `.env.local` or `.env` file in the root directory:
   ```env
   OPENAI_API_KEY="sk-your-openai-api-key-here"
   ```
   *(Alternatively, `GEMINI_API_KEY` is also supported automatically)*

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to start generating viral video packs.

## Features

- **Custom Word Count Target**: Set exact desired script lengths beyond fixed durations (50 to 3,000 words), with quick chips (150w Short, 450w, 750w, 1,200w, 1,500w, 2,500w Doc) and dynamic voiceover pacing calculations (~140 WPM).
- **Single-Call Generation**: Generates hook + 3 points + CTA script, 3 viral titles, SEO description, and search tags in a single API call to minimize latency and token costs.
- **Editable Live Script**: Real-time word count, target comparison badge (% of goal), speaking time estimator, and clean editing interface.
- **One-Click Clipboards**: Copy any title, description, tags, or script with instant visual feedback.
- **Project Persistence**: Automatically saves generated packs to `localStorage` for instant reload anytime.
- **Export Options**: Download formatted `script.txt` with metadata directly to your machine.
- **Aesthetic**: Minimalist Notion & YouTube Studio theme with `#7C3AED` purple CTA accents.
