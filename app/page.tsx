'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  RotateCcw,
  Youtube,
  FileText,
  Clock,
  Hash,
  AlertCircle,
  Flame,
  ArrowRight,
  FolderOpen,
  Sliders,
  Target,
  Gauge,
} from 'lucide-react';

export interface ProjectItem {
  id: string;
  date: string;
  topic: string;
  niche: string;
  duration: string;
  targetWordCount: number;
  script: string;
  titles: string[];
  description: string;
  tags: string[];
  provider?: string;
}

const NICHES = ['Finance', 'Tech', 'Motivation', 'AI', 'Health'] as const;

const DURATION_PRESETS: { label: string; defaultWords: number; hint: string }[] = [
  { label: '60s Short', defaultWords: 150, hint: '~150 words (YouTube Shorts / Reels)' },
  { label: '5min', defaultWords: 750, hint: '~750 words (Standard high-retention video)' },
  { label: '10min', defaultWords: 1500, hint: '~1,500 words (Mid-roll monetized deep-dive)' },
  { label: 'Custom Target', defaultWords: 1000, hint: 'Exact custom script word count' },
];

const WORD_COUNT_PRESETS = [
  { words: 150, label: '150w (Short)' },
  { words: 450, label: '450w (3min)' },
  { words: 750, label: '750w (5min)' },
  { words: 1200, label: '1,200w (8min)' },
  { words: 1500, label: '1,500w (10min)' },
  { words: 2500, label: '2,500w (Doc)' },
];

const QUICK_TOPICS = [
  { topic: 'How to make $10,000/mo with AI faceless channels in 2026', niche: 'Finance', duration: '5min', targetWords: 750 },
  { topic: 'Top 5 Autonomous AI Agents That Are Replacing Software Engineers', niche: 'Tech', duration: '5min', targetWords: 800 },
  { topic: 'The 10-Minute Morning Routine That Rewires Your Dopamine', niche: 'Motivation', duration: '60s Short', targetWords: 150 },
  { topic: 'The Longevity Protocol: 3 Science-Backed Sleep Hacks', niche: 'Health', duration: '5min', targetWords: 700 },
  { topic: 'Why 99% of People Will Fail to Monetize Generative AI', niche: 'AI', duration: '10min', targetWords: 1500 },
];

export default function ExoTubeStudio() {
  const [topic, setTopic] = useState('');
  const [niche, setNiche] = useState<string>('Tech');
  const [duration, setDuration] = useState<string>('5min');
  const [targetWordCount, setTargetWordCount] = useState<number>(750);
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Active generated output
  const [generatedScript, setGeneratedScript] = useState('');
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([]);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [lastGeneratedTarget, setLastGeneratedTarget] = useState<number | null>(null);

  // Copy status indicators
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTitleIndex, setCopiedTitleIndex] = useState<number | null>(null);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedTagsAll, setCopiedTagsAll] = useState(false);
  const [copiedSingleTag, setCopiedSingleTag] = useState<string | null>(null);

  // Saved Projects from localStorage
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Mobile active tab: 'controls' | 'script' | 'seo'
  const [mobileTab, setMobileTab] = useState<'controls' | 'script' | 'seo'>('controls');

  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('exotube_projects');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setProjects(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load projects from localStorage:', e);
    }
  }, []);

  // Save projects to localStorage
  const saveProjectsToStorage = (updatedList: ProjectItem[]) => {
    setProjects(updatedList);
    try {
      localStorage.setItem('exotube_projects', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  };

  // Safe clipboard helper
  const copyToClipboard = async (text: string, onSuccess: () => void) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        onSuccess();
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        onSuccess();
      }
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Handle duration dropdown change
  const handleDurationChange = (selectedDur: string) => {
    setDuration(selectedDur);
    const matched = DURATION_PRESETS.find((p) => p.label === selectedDur);
    if (matched) {
      setTargetWordCount(matched.defaultWords);
    }
  };

  // Handle direct word count change from slider or number input
  const handleWordCountChange = (value: number) => {
    const clamped = Math.max(50, Math.min(3000, value));
    setTargetWordCount(clamped);

    // Keep duration dropdown in sync if matching standard preset, else set to Custom
    if (clamped <= 200) {
      setDuration('60s Short');
    } else if (clamped >= 650 && clamped <= 850) {
      setDuration('5min');
    } else if (clamped >= 1400 && clamped <= 1650) {
      setDuration('10min');
    } else {
      setDuration('Custom Target');
    }
  };

  // Real-time word count & speaking time calculation
  const wordCount = generatedScript.trim() ? generatedScript.trim().split(/\s+/).length : 0;
  const readingTimeSec = Math.round((wordCount / 140) * 60);
  const readingTimeFormatted =
    readingTimeSec < 60
      ? `${readingTimeSec}s`
      : `${Math.floor(readingTimeSec / 60)}m ${readingTimeSec % 60}s`;

  // Estimated pacing for target word count
  const targetTimeSec = Math.round((targetWordCount / 140) * 60);
  const targetTimeFormatted =
    targetTimeSec < 60
      ? `${targetTimeSec}s`
      : `${Math.floor(targetTimeSec / 60)}m ${targetTimeSec % 60}s`;

  // Accuracy calculation when generated
  const targetComparison = lastGeneratedTarget
    ? {
        diff: wordCount - lastGeneratedTarget,
        percentage: Math.round((wordCount / lastGeneratedTarget) * 100),
      }
    : null;

  // Real API call to /api/generate with topic, niche, duration, and targetWordCount
  const handleGenerate = async () => {
    if (!topic.trim() || loading) return;

    setLoading(true);
    setErrorNotice(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          niche,
          duration,
          targetWordCount,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.warning || 'Add valid OpenAI key in .env.local');
      }

      const data = await response.json();

      const newScript = data.script || '';
      const newTitles = Array.isArray(data.titles) ? data.titles : [];
      const newDescription = data.description || '';
      const newTags = Array.isArray(data.tags) ? data.tags : [];

      setGeneratedScript(newScript);
      setGeneratedTitles(newTitles);
      setGeneratedDescription(newDescription);
      setGeneratedTags(newTags);
      setActiveProvider(data.provider || 'ai');
      setLastGeneratedTarget(targetWordCount);

      if (data.warning) {
        setErrorNotice(data.warning);
      }

      // Save to localStorage projects list
      const newProject: ProjectItem = {
        id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        topic: topic.trim(),
        niche,
        duration,
        targetWordCount,
        script: newScript,
        titles: newTitles,
        description: newDescription,
        tags: newTags,
        provider: data.provider,
      };

      setActiveProjectId(newProject.id);
      const updatedList = [newProject, ...projects.filter((p) => p.topic.toLowerCase() !== topic.trim().toLowerCase())].slice(0, 30);
      saveProjectsToStorage(updatedList);

      // On mobile switch to script tab
      setMobileTab('script');
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorNotice('Add valid OpenAI key in .env.local');
    } finally {
      setLoading(false);
    }
  };

  // Reload an existing project from history
  const handleLoadProject = (proj: ProjectItem) => {
    setTopic(proj.topic);
    setNiche(proj.niche);
    setDuration(proj.duration);
    const words = proj.targetWordCount || (proj.duration === '60s Short' ? 150 : proj.duration === '10min' ? 1500 : 750);
    setTargetWordCount(words);
    setLastGeneratedTarget(words);
    setGeneratedScript(proj.script);
    setGeneratedTitles(proj.titles);
    setGeneratedDescription(proj.description);
    setGeneratedTags(proj.tags);
    setActiveProvider(proj.provider || 'local');
    setActiveProjectId(proj.id);
    setErrorNotice(null);
    setMobileTab('script');
  };

  // Delete project from history
  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = projects.filter((p) => p.id !== id);
    saveProjectsToStorage(updated);
    if (activeProjectId === id) {
      setActiveProjectId(null);
    }
  };

  // Clear current studio session
  const handleClear = () => {
    setTopic('');
    setGeneratedScript('');
    setGeneratedTitles([]);
    setGeneratedDescription('');
    setGeneratedTags([]);
    setActiveProvider(null);
    setActiveProjectId(null);
    setLastGeneratedTarget(null);
    setErrorNotice(null);
    setMobileTab('controls');
  };

  // Export TXT: creates blob and downloads script.txt
  const handleExportTxt = () => {
    if (!generatedScript && generatedTitles.length === 0) return;

    const separator = '========================================';
    const content = `EXOTUBE YOUTUBE AUTOMATION PACK
Generated: ${new Date().toISOString()}
Topic: ${topic || 'Untitled Video'}
Niche: ${niche}
Format / Duration: ${duration}
Target Word Count: ${lastGeneratedTarget || targetWordCount} words
Actual Script Words: ${wordCount} words (~${readingTimeFormatted} speaking time at 140 WPM)
${separator}

VIRAL TITLES:
${generatedTitles.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}

${separator}
SEO DESCRIPTION:
${generatedDescription}

${separator}
KEYWORDS / TAGS:
${generatedTags.join(', ')}

${separator}
FULL VIDEO SCRIPT:
${generatedScript}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanFileName = topic
      ? `${topic.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}_script.txt`
      : 'script.txt';
    link.download = cleanFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isGenerated = Boolean(generatedScript || generatedTitles.length > 0);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 font-sans antialiased flex flex-col selection:bg-[#7C3AED]/20 selection:text-[#7C3AED]">
      {/* Top Navigation Bar - Notion + YouTube Studio hybrid header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-xs">
              <Youtube className="w-4 h-4 text-red-500 fill-red-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-neutral-900">ExoTube</span>
              <span className="text-[11px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                Studio
              </span>
            </div>
            <span className="hidden md:inline text-neutral-300">/</span>
            <span className="hidden md:inline text-xs text-neutral-500 font-medium">
              Viral YouTube Automation Engine
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeProvider && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-medium capitalize">{activeProvider} Engine</span>
              </span>
            )}

            {isGenerated && (
              <>
                <button
                  onClick={handleExportTxt}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs cursor-pointer"
                  title="Download full video pack as text file"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Export TXT</span>
                </button>

                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-neutral-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-neutral-600 transition-colors cursor-pointer"
                  title="Clear current workspace"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden flex border-t border-neutral-200 bg-white px-2">
          <button
            onClick={() => setMobileTab('controls')}
            className={`flex-1 py-2 text-xs font-medium text-center border-b-2 transition-colors ${
              mobileTab === 'controls'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            1. Topic & Config
          </button>
          <button
            onClick={() => setMobileTab('script')}
            className={`flex-1 py-2 text-xs font-medium text-center border-b-2 transition-colors ${
              mobileTab === 'script'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            2. Script Editor {wordCount > 0 && `(${wordCount}w)`}
          </button>
          <button
            onClick={() => setMobileTab('seo')}
            className={`flex-1 py-2 text-xs font-medium text-center border-b-2 transition-colors ${
              mobileTab === 'seo'
                ? 'border-[#7C3AED] text-[#7C3AED]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            3. Titles & SEO {generatedTitles.length > 0 && `(${generatedTitles.length})`}
          </button>
        </div>
      </header>

      {/* Error / Notice Banner */}
      {errorNotice && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="max-w-[1600px] mx-auto w-full flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{errorNotice}</span>
            <span className="text-amber-700 hidden sm:inline">
              — A high-retention structured viral video pack was generated for you.
            </span>
          </div>
          <button
            onClick={() => setErrorNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold px-2 py-0.5 text-sm cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Main 3-Column Working Studio Grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: LEFT - Input form & Studio Parameters (lg:col-span-4) */}
        <section
          className={`lg:col-span-4 space-y-5 ${
            mobileTab === 'controls' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-2xs space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="topic-input" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Video Topic
                </label>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {topic.length}/140
                </span>
              </div>
              <textarea
                id="topic-input"
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value.slice(0, 140))}
                placeholder="e.g. How to make $10,000/mo with AI in 2026..."
                className="w-full text-sm rounded-lg border border-neutral-200 p-3 text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-neutral-400 block">Try popular formats:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TOPICS.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setTopic(item.topic);
                      setNiche(item.niche);
                      setDuration(item.duration);
                      setTargetWordCount(item.targetWords);
                    }}
                    className="text-[11px] text-left px-2 py-1 rounded bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-700 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {item.niche}: {item.topic.slice(0, 24)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Niche Dropdown */}
            <div>
              <label htmlFor="niche-select" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                Target Niche
              </label>
              <select
                id="niche-select"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full text-sm rounded-lg border border-neutral-200 bg-white p-2.5 text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all cursor-pointer"
              >
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration Preset Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="duration-select" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Format Category
                </label>
                <span className="text-[11px] text-neutral-400">
                  {DURATION_PRESETS.find((p) => p.label === duration)?.hint || 'Custom length'}
                </span>
              </div>
              <select
                id="duration-select"
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-full text-sm rounded-lg border border-neutral-200 bg-white p-2.5 text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all cursor-pointer"
              >
                {DURATION_PRESETS.map((d) => (
                  <option key={d.label} value={d.label}>
                    {d.label} ({d.defaultWords} words)
                  </option>
                ))}
              </select>
            </div>

            {/* CUSTOM WORD COUNT TARGET CONTROL */}
            <div className="rounded-lg border border-purple-100 bg-purple-50/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <label htmlFor="target-words-input" className="text-xs font-semibold text-neutral-900">
                    Target Word Count
                  </label>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    id="target-words-input"
                    type="number"
                    min={50}
                    max={3000}
                    step={25}
                    value={targetWordCount}
                    onChange={(e) => handleWordCountChange(Number(e.target.value))}
                    className="w-20 text-xs font-mono font-semibold text-right py-1 px-2 rounded border border-neutral-200 bg-white text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-[#7C3AED]"
                  />
                  <span className="text-xs text-neutral-500 font-medium">words</span>
                </div>
              </div>

              {/* Range Slider for Fine Control */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={50}
                  max={3000}
                  step={25}
                  value={targetWordCount}
                  onChange={(e) => handleWordCountChange(Number(e.target.value))}
                  className="w-full accent-[#7C3AED] cursor-pointer h-1.5 bg-neutral-200 rounded-lg"
                />
                <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                  <span>50w (Short)</span>
                  <span>1,000w</span>
                  <span>2,000w</span>
                  <span>3,000w (Deep)</span>
                </div>
              </div>

              {/* Quick Word Count Target Chips */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="font-medium">Quick Targets:</span>
                  <span className="text-[#7C3AED] font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>~{targetTimeFormatted} at 140 WPM</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {WORD_COUNT_PRESETS.map((preset) => (
                    <button
                      key={preset.words}
                      type="button"
                      onClick={() => handleWordCountChange(preset.words)}
                      className={`text-[11px] py-1 px-1.5 text-center rounded border transition-colors cursor-pointer font-medium ${
                        targetWordCount === preset.words
                          ? 'bg-[#7C3AED] text-white border-[#7C3AED] shadow-2xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Action Button: #7C3AED Purple */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={!topic.trim() || loading}
                onClick={handleGenerate}
                className="w-full h-11 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating {targetWordCount}w Script...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Generate Video Pack ({targetWordCount}w)</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1">
                <span>Custom word target calibration</span>
                <span>Ready in &lt;10s</span>
              </div>
            </div>
          </div>

          {/* Retention Architecture Card */}
          <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 space-y-2.5 text-xs text-neutral-600">
            <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Pacing & Word Count Strategy</span>
            </div>
            <p className="text-neutral-500 leading-relaxed text-[11px]">
              Average YouTube speakers deliver <strong>130 to 150 words per minute</strong>. Setting a strict word target guarantees pacing matches your target video duration without filler content.
            </p>
          </div>
        </section>

        {/* COLUMN 2: CENTER - Script Canvas & Live Editor (lg:col-span-5) */}
        <section
          className={`lg:col-span-5 space-y-4 ${
            mobileTab === 'script' ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="bg-white rounded-xl border border-neutral-200 shadow-2xs overflow-hidden flex flex-col min-h-[620px]">
            {/* Script Toolbar */}
            <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50/70 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <FileText className="w-4 h-4 text-neutral-600" />
                <span className="text-xs font-semibold text-neutral-900">Script Editor</span>
                
                {isGenerated && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-[#7C3AED] border border-purple-200 font-medium">
                      {wordCount} words
                    </span>

                    {targetComparison && (
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded border font-medium flex items-center gap-1 ${
                          Math.abs(targetComparison.diff) <= Math.round((lastGeneratedTarget || 750) * 0.15)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                        title={`Target: ${lastGeneratedTarget} words`}
                      >
                        <Target className="w-3 h-3" />
                        <span>
                          {targetComparison.percentage}% of {lastGeneratedTarget}w target
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {isGenerated && (
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-neutral-500 mr-2">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>~{readingTimeFormatted}</span>
                  </span>

                  <button
                    onClick={() =>
                      copyToClipboard(generatedScript, () => {
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      })
                    }
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 transition-colors shadow-2xs cursor-pointer"
                    title="Copy full script"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExportTxt}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 transition-colors shadow-2xs cursor-pointer"
                    title="Download script.txt"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-500" />
                    <span>TXT</span>
                  </button>
                </div>
              )}
            </div>

            {/* Script Body or Empty State */}
            <div className="flex-1 flex flex-col p-4">
              {!isGenerated ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] mb-3">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-neutral-900 mb-1">Enter topic & set word target</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mb-4 leading-relaxed">
                    Set your custom word count target or choose a duration preset to generate a high-retention YouTube script calibrated to your exact length.
                  </p>
                  <button
                    onClick={() => {
                      setTopic('How to make $10,000/mo with AI faceless channels in 2026');
                      setNiche('Finance');
                      setDuration('5min');
                      setTargetWordCount(750);
                    }}
                    className="text-xs font-medium text-[#7C3AED] hover:text-[#6D28D9] flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Or load 750w demo template</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <textarea
                  rows={24}
                  value={generatedScript}
                  onChange={(e) => setGeneratedScript(e.target.value)}
                  className="w-full flex-1 p-3 text-sm text-neutral-800 font-mono leading-relaxed bg-neutral-50/30 rounded-lg border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all resize-y"
                  placeholder="Generated script will appear here. You can edit directly..."
                />
              )}
            </div>

            {/* Footer with metadata */}
            {isGenerated && (
              <div className="px-4 py-2.5 border-t border-neutral-200 bg-neutral-50 text-[11px] text-neutral-500 flex items-center justify-between flex-wrap gap-2">
                <span>Hook, 3 retention points, and CTA included</span>
                <span className="text-neutral-400 font-mono">
                  {lastGeneratedTarget ? `Calibrated to ~${lastGeneratedTarget} words` : 'Custom target applied'}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* COLUMN 3: RIGHT - Titles, Description & Tags (lg:col-span-3) */}
        <section
          className={`lg:col-span-3 space-y-4 ${
            mobileTab === 'seo' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* 3 Clickable Titles */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>3 Viral Titles</span>
              </span>
              <span className="text-[11px] text-neutral-400">High CTR</span>
            </div>

            {!isGenerated ? (
              <div className="p-4 text-center text-xs text-neutral-400 border border-neutral-100 rounded-lg bg-neutral-50/50">
                Titles will be generated here
              </div>
            ) : (
              <div className="space-y-2">
                {generatedTitles.map((titleText, idx) => (
                  <div
                    key={idx}
                    className="group relative p-2.5 rounded-lg border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300 transition-all flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-400 mt-0.5">
                        {idx + 1}.
                      </span>
                      <p className="text-xs font-medium text-neutral-800 leading-snug">
                        {titleText}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(titleText, () => {
                          setCopiedTitleIndex(idx);
                          setTimeout(() => setCopiedTitleIndex(null), 2000);
                        })
                      }
                      className="shrink-0 p-1.5 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-600 transition-colors shadow-2xs cursor-pointer"
                      title="Copy title to clipboard"
                    >
                      {copiedTitleIndex === idx ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO Description */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                SEO Description
              </span>
              {isGenerated && (
                <button
                  onClick={() =>
                    copyToClipboard(generatedDescription, () => {
                      setCopiedDesc(true);
                      setTimeout(() => setCopiedDesc(false), 2000);
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedDesc ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {!isGenerated ? (
              <div className="p-4 text-center text-xs text-neutral-400 border border-neutral-100 rounded-lg bg-neutral-50/50">
                SEO description will be generated here
              </div>
            ) : (
              <textarea
                rows={6}
                value={generatedDescription}
                onChange={(e) => setGeneratedDescription(e.target.value)}
                className="w-full text-xs font-mono rounded-lg border border-neutral-200 p-2.5 text-neutral-700 bg-neutral-50/30 focus:outline-hidden focus:ring-1 focus:ring-[#7C3AED] resize-none"
              />
            )}
          </div>

          {/* Keyword Tags */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Hash className="w-3 h-3 text-neutral-400" />
                <span>Search Tags ({generatedTags.length})</span>
              </span>
              {isGenerated && generatedTags.length > 0 && (
                <button
                  onClick={() =>
                    copyToClipboard(generatedTags.join(', '), () => {
                      setCopiedTagsAll(true);
                      setTimeout(() => setCopiedTagsAll(false), 2000);
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-700 transition-colors shadow-2xs cursor-pointer"
                >
                  {copiedTagsAll ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied All</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-neutral-500" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {!isGenerated || generatedTags.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400 border border-neutral-100 rounded-lg bg-neutral-50/50">
                Tags will be generated here
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {generatedTags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      copyToClipboard(tag, () => {
                        setCopiedSingleTag(tag);
                        setTimeout(() => setCopiedSingleTag(null), 1500);
                      })
                    }
                    className="text-[11px] px-2 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono transition-colors flex items-center gap-1 cursor-pointer"
                    title="Click to copy tag"
                  >
                    <span>#{tag}</span>
                    {copiedSingleTag === tag ? (
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM SECTION: Saved Projects History from localStorage */}
        <section className="col-span-1 lg:col-span-12 mt-4 space-y-3">
          <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-neutral-600" />
              <h2 className="text-sm font-semibold text-neutral-900">Saved Projects History</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200">
                {projects.length}
              </span>
            </div>

            {projects.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Clear all saved project history?')) {
                    saveProjectsToStorage([]);
                  }
                }}
                className="text-xs text-neutral-500 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 bg-white border border-neutral-200 rounded-xl">
              No previous projects yet. Generate your first video pack above to automatically save it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((proj) => {
                const isActive = activeProjectId === proj.id;
                const projWordCount = proj.script ? proj.script.trim().split(/\s+/).length : 0;
                const projTargetWords = proj.targetWordCount || (proj.duration === '60s Short' ? 150 : proj.duration === '10min' ? 1500 : 750);

                return (
                  <div
                    key={proj.id}
                    onClick={() => handleLoadProject(proj)}
                    className={`group text-left p-4 rounded-xl border transition-all cursor-pointer bg-white relative ${
                      isActive
                        ? 'border-[#7C3AED] ring-2 ring-[#7C3AED]/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-50 text-[#7C3AED] border border-purple-100">
                          {proj.niche}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
                          {proj.duration}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50/70 text-[#7C3AED] border border-purple-100 font-mono font-medium">
                          {projTargetWords}w target
                        </span>
                        <span className="text-[10px] text-neutral-400">{proj.date}</span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteProject(e, proj.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-all cursor-pointer"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-semibold text-neutral-900 line-clamp-1 mb-1">
                      {proj.topic}
                    </h4>

                    {proj.titles?.[0] && (
                      <p className="text-[11px] text-neutral-500 line-clamp-1 italic mb-2">
                        "{proj.titles[0]}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
                      <span>{projWordCount} words</span>
                      <span className="text-[#7C3AED] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        <span>Load Script</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200 bg-white py-4 px-6 text-center text-xs text-neutral-400">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ExoTube Studio — YouTube Automation & Viral Retention Engine</span>
          <span className="text-[11px]">Precision Word Target Calibration • Notion + Studio Design</span>
        </div>
      </footer>
    </div>
  );
}
