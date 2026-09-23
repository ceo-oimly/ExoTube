import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

export interface GenerateRequest {
  topic: string;
  niche: string;
  duration: string;
  targetWordCount?: number;
}

export interface GenerateResponse {
  script: string;
  titles: string[];
  description: string;
  tags: string[];
  targetWordCount?: number;
  provider?: 'openai' | 'gemini' | 'demo';
  warning?: string;
}

function getFallbackData(topic: string, niche: string, duration: string, targetWordCount?: number): GenerateResponse {
  const cleanTopic = topic.trim() || 'How to build high-income automated digital assets';
  const durationLabel = duration || '5min';

  const shortScript = `[0:00 - HOOK]
Stop scrolling. 99% of people are approaching ${cleanTopic} completely backward, and it's costing them months of wasted effort.

[0:15 - POINT 1: THE BIG MISTAKE]
Most beginners think success in ${niche} requires endless grind and brute force. In reality, the top 1% leverage automated systems and focused execution. If you don't understand the foundational leverage point, everything else collapses.

[0:30 - POINT 2: THE UNFAIR ADVANTAGE]
Here is the exact playbook: First, audit your bottleneck. Second, deploy pre-validated workflows rather than reinventing the wheel. Notice how the fastest growing creators in ${niche} obsess over retention and distribution before anything else.

[0:45 - POINT 3: THE ACTION TRIGGER]
Start today by executing the 1-hour sprint rule: pick one high-value asset, produce the prototype, and test with real audience feedback before scaling.

[0:55 - CTA]
If you want the complete step-by-step blueprint and free cheat sheet, hit subscribe, drop a comment with your biggest question below, and check the description for the direct link.`;

  const standardScript = `[0:00 - 0:45 | THE HOOK & PATTERN INTERRUPT]
If you are still trying to figure out ${cleanTopic} using outdated advice from two years ago, you need to hear this before you waste another dollar or another hour. 
In this video, I'm breaking down the exact 3-part framework that transformed our approach in ${niche}, backed by real case studies and numbers you can replicate starting today.

[0:45 - 2:00 | POINT 1: THE CORE MISCONCEPTION]
The biggest trap most people fall into when studying ${cleanTopic} is focusing on surface-level tactics instead of root-level leverage.
Everyone wants the quick hack, but high performers in ${niche} know that consistency beats intensity every single day.
When you strip away the noise, there are only two metrics that actually move the needle: audience retention and sustainable compounding. Let me show you what happens when you adjust just one variable in your routine...

[2:00 - 3:30 | POINT 2: THE 3X ACCELERATION FORMULA]
Now let's talk about the secret weapon. While your competitors are stuck doing manual guesswork, the top 1% deploy a repeatable 3-step loop:
1. Data-backed validation: Know what the audience desires before creating.
2. Rapid production architecture: Build modular assets that scale without burning you out.
3. Distribution amplification: Repurpose core insights across multiple discovery channels.
Look at how this applies directly to ${cleanTopic}—the moment you implement this shift, results start compounding exponentially.

[3:30 - 4:20 | POINT 3: THE STEP-BY-STEP EXECUTION ROADMAP]
Here is your immediate action plan for the next 48 hours:
Step 1: Eliminate the bottom 20% of distractions draining your momentum in ${niche}.
Step 2: Set up a dedicated tracker for your primary key performance indicator.
Step 3: Commit to 14 days of relentless iteration based strictly on user feedback.

[4:20 - 5:00 | CONCLUSION & CALL TO ACTION]
Mastering ${cleanTopic} is not about luck—it is about following a proven system with ruthless discipline.
If you found value in this breakdown, hit that Like button to support the channel, subscribe for weekly masterclasses on ${niche}, and leave a comment below telling me which point you're putting into practice first. 
All relevant resources and templates are linked down in the description. I will see you in the next video!`;

  const longScript = `[0:00 - 1:15 | SECTION 1: THE HOOK & SYSTEM BREAKDOWN]
If you are trying to understand ${cleanTopic}, most of what you've seen online is missing the single most crucial variable.
In this masterclass, we are peeling back every layer of ${cleanTopic} within the context of modern ${niche}. By the time this video ends, you will have an end-to-end blueprint that you can implement immediately.
Whether you are starting from zero or optimizing existing operations, this framework removes guesswork and replaces it with predictable leverage.

[1:15 - 3:30 | SECTION 2: THE ANATOMY OF FAILURE IN ${niche.toUpperCase()}]
Why do 95% of practitioners hit an invisible wall with ${cleanTopic}?
It comes down to three structural bottlenecks:
First: Misallocation of focus. Beginners spend 80% of their energy on low-impact peripheral setup rather than core distribution and retention mechanics.
Second: Lack of compounding workflows. If every cycle requires starting from scratch, fatigue will inevitably destroy consistency.
Third: Premature scaling before finding organic market alignment. In ${niche}, precision always outperforms volume. Let's look at real-world data demonstrating the compounding difference between linear effort versus exponential systemic leverage...

[3:30 - 6:45 | SECTION 3: THE 3-PILLAR ACCELERATION ENGINE]
Here is the exact step-by-step engine used by top 1% creators and operators:
Pillar 1: Data-Driven Calibration.
Before creating anything, run high-signal validation checks. Identify existing demand clusters, search intent gaps, and competitive blind spots.
Pillar 2: Modular Production Architecture.
Break ${cleanTopic} down into reusable modular components. When your workflow is modularized, what used to take days now takes minutes.
Pillar 3: Feedback Loops & Metric Optimization.
Track the two north-star metrics that govern ${niche}: early audience retention and conversion rate. Double down on what works, discard what stalls.

[6:45 - 8:30 | SECTION 4: REAL-WORLD CASE STUDY & IMPLEMENTATION BLUEPRINT]
Let's walk through a concrete breakdown of how this plays out in practice.
Notice how applying the modular blueprint directly to ${cleanTopic} eliminates friction.
Within 14 days, you establish steady baseline metrics. Within 60 days, compounding effects take over.

[8:30 - 9:45 | SECTION 5: COMMON PITFALLS TO AVOID]
Before you start, beware of these three critical traps:
1. Don't chase trendy shortcuts that fail after the algorithm shifts.
2. Don't sacrifice long-term trust for short-term vanity metrics.
3. Don't execute in isolation—seek objective feedback loops.

[9:45 - 10:30 | CONCLUSION & NEXT STEPS]
Mastering ${cleanTopic} in ${niche} is entirely within your control when you follow an engineering mindset.
If this in-depth guide brought you clarity, hit the Like button and Subscribe to stay ahead in ${niche}.
Drop a comment below with your primary takeaway or question. All actionable templates, resources, and checklists are linked in the description. See you in the next breakdown!`;

  let scriptText = standardScript;
  if (targetWordCount) {
    if (targetWordCount <= 250) {
      scriptText = shortScript;
    } else if (targetWordCount >= 900) {
      scriptText = longScript;
    } else {
      scriptText = standardScript;
    }
  } else {
    if (durationLabel === '60s Short') {
      scriptText = shortScript;
    } else if (durationLabel === '10min') {
      scriptText = longScript;
    } else {
      scriptText = standardScript;
    }
  }

  return {
    script: scriptText,
    titles: [
      `I Tested ${cleanTopic} for 30 Days (The Brutal Truth)`,
      `How to Master ${cleanTopic} Faster Than 99% of People`,
      `The Ultimate ${niche} Guide: ${cleanTopic} Explained`,
    ],
    description: `Everything you need to know about ${cleanTopic} in one comprehensive guide.\n\nIn this video, we break down actionable insights for ${niche}, revealing the step-by-step blueprint to achieve real results without burning out.\n\n📌 TIMESTAMPS:\n0:00 - The Harsh Truth\n0:45 - The Critical Mistake to Avoid\n2:00 - The 3-Step Scaling Framework\n3:30 - Action Plan & Execution\n4:20 - Next Steps\n\n🔔 Subscribe to the channel for high-impact ${niche} tutorials and automation breakdowns!\n💬 Drop your questions in the comments below.\n\n#${niche.toLowerCase().replace(/\s+/g, '')} #${cleanTopic.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15)} #YouTubeAutomation`,
    tags: [
      cleanTopic.toLowerCase(),
      `${niche.toLowerCase()} guide`,
      `${cleanTopic.toLowerCase()} tutorial`,
      'youtube automation',
      `${niche.toLowerCase()} 2026`,
      'how to',
      'step by step tutorial',
      'growth strategy',
      'viral video tips',
      'beginner to pro',
    ],
    targetWordCount,
    provider: 'demo',
    warning: 'Add valid OpenAI key in .env.local to use live OpenAI gpt-4o-mini',
  };
}

export async function generateVideoPack(body: GenerateRequest): Promise<GenerateResponse> {
  const { topic, niche, duration, targetWordCount } = body;

  if (!topic || !topic.trim()) {
    throw new Error('Topic is required');
  }

  const wordCountConstraint = targetWordCount
    ? `Target word count: approximately ${targetWordCount} words (strict requirement: maintain actual script length between ${Math.round(targetWordCount * 0.9)} and ${Math.round(targetWordCount * 1.15)} words).`
    : `Target duration: ${duration}.`;

  const prompt = `You are expert viral YouTuber with 10M subs in ${niche}. Write a ${duration || 'video'} script about ${topic}. ${wordCountConstraint} Structure: HOOK, 3 detailed retention points, and compelling CTA. Return JSON ONLY: { "script": "full script with HOOK, 3 points, CTA", "titles": ["title1", "title2", "title3"], "description": "SEO description with keywords", "tags": ["tag1","tag2"] } JSON only, no markdown`;

  // 1. Try OpenAI if OPENAI_API_KEY is configured
  const openAiKey = process.env.OPENAI_API_KEY;
  if (openAiKey && openAiKey.startsWith('sk-') && openAiKey.length > 20) {
    try {
      const openai = new OpenAI({ apiKey: openAiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: prompt },
          {
            role: 'user',
            content: `Topic: ${topic}\nNiche: ${niche}\nDuration: ${duration}${targetWordCount ? `\nTarget Word Count: ${targetWordCount} words` : ''}\nGenerate the complete YouTube video pack now.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          script: parsed.script || '',
          titles: Array.isArray(parsed.titles) ? parsed.titles : [parsed.title || 'Viral Video Title'],
          description: parsed.description || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          targetWordCount,
          provider: 'openai',
        };
      }
    } catch (err) {
      console.error('OpenAI API call failed:', err);
      // Fall through to Gemini or Demo
    }
  } else {
    console.warn('OpenAI key missing or placeholder. Checking Gemini or falling back to demo.');
  }

  // 2. Try Gemini API if GEMINI_API_KEY is present
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return {
          script: parsed.script || '',
          titles: Array.isArray(parsed.titles) ? parsed.titles : [parsed.title || 'Viral Video Title'],
          description: parsed.description || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          targetWordCount,
          provider: 'gemini',
        };
      }
    } catch (geminiErr) {
      console.error('Gemini API call failed:', geminiErr);
    }
  }

  // 3. Fallback demo data
  console.error('Add valid OpenAI key in .env.local');
  return getFallbackData(topic, niche, duration, targetWordCount);
}

// Next.js 14 App Router handler
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateRequest;
    if (!body || !body.topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await generateVideoPack(body);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Route error in /api/generate:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Generation failed',
        warning: 'Add valid OpenAI key in .env.local',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
