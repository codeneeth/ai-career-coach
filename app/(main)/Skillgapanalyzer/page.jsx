"use client";
import { useState } from "react";
import {
  Loader2, ChevronRight, X, Plus, Target, TrendingUp,
  AlertCircle, CheckCircle2, Clock, BookOpen, Sparkles,
  BarChart2, Zap, ArrowRight,
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { analyzeSkillGap } from "@/actions/skillGap";

const inputClass =
  "w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900";

const PRIORITY_STYLE = {
  critical: { cls: "text-red-400 bg-red-400/10 border-red-400/20",    dot: "bg-red-400" },
  high:     { cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20", dot: "bg-yellow-400" },
  medium:   { cls: "text-blue-400 bg-blue-400/10 border-blue-400/20",  dot: "bg-blue-400" },
};

const POPULAR = [
  "Software Engineer at Google",
  "Product Manager at Meta",
  "Data Scientist at OpenAI",
  "Frontend Engineer at Stripe",
  "ML Engineer at DeepMind",
  "DevOps at Netflix",
];

// ── Skill Bar ─────────────────────────────────────────────────────────
function SkillBar({ name, score, required, category }) {
  const gap = required - score;
  const isMissing = score < 70;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-300 font-medium">{name}</span>
          <span className="text-xs text-slate-600 bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded">{category}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={isMissing ? "text-red-400" : "text-green-400"}>{score}%</span>
          <span className="text-slate-600">/ {required}% req.</span>
        </div>
      </div>
      <div className="relative h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
        {/* Required marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-[#3a3a3a] z-10"
          style={{ left: `${required}%` }}
        />
        {/* Current score */}
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            background: isMissing
              ? "linear-gradient(90deg, #ef4444, #f87171)"
              : "linear-gradient(90deg, #4f46e5, #818cf8)",
          }}
        />
      </div>
      {isMissing && gap > 0 && (
        <p className="text-xs text-slate-600">{gap}% gap to close</p>
      )}
    </div>
  );
}

// ── Custom Radar Tooltip ──────────────────────────────────────────────
function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-slate-200 mb-1">{payload[0]?.payload?.subject}</p>
      <p className="text-indigo-400">Required: {payload[0]?.value}%</p>
      <p className="text-slate-400">Current: {payload[1]?.value}%</p>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────
export default function SkillGapAnalyzer() {
  const [targetInput, setTargetInput] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("skills");

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || userSkills.includes(s)) return;
    setUserSkills(p => [...p, s]);
    setSkillInput("");
  };

  const removeSkill = (s) => setUserSkills(p => p.filter(x => x !== s));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
  };

  const parseTarget = (input) => {
    const parts = input.split(" at ");
    if (parts.length === 2) return { role: parts[0].trim(), company: parts[1].trim() };
    return { role: input.trim(), company: "a top tech company" };
  };

  const analyze = async () => {
    if (!targetInput.trim()) { setError("Please enter a target role."); return; }
    setError("");
    setLoading(true);
    try {
      const { role, company } = parseTarget(targetInput);
      const data = await analyzeSkillGap({ targetRole: role, targetCompany: company, userSkills });
      setResult(data);
      setActiveTab("skills");
    } catch {
      setError("Analysis failed. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(""); };

  // ── INPUT SCREEN ─────────────────────────────────────────────────
  if (!result) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl space-y-3">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#141414] px-4 py-1.5 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">AI Skill Gap Analyzer</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Where do you stand?</h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Enter your target role and current skills. AI will show you exactly what's missing and how to close the gap.
          </p>
        </div>

        {/* Target Role */}
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
          <div className="border-b border-[#2a2a2a] px-5 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Role</p>
          </div>
          <div className="p-5 space-y-3">
            <input
              type="text"
              value={targetInput}
              onChange={e => setTargetInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && analyze()}
              placeholder='e.g. "Software Engineer at Google"'
              className={inputClass}
            />
            <div className="flex flex-wrap gap-2">
              {POPULAR.map(p => (
                <button
                  key={p}
                  onClick={() => setTargetInput(p)}
                  className="text-xs text-slate-500 border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 rounded-lg hover:text-slate-300 hover:border-[#3a3a3a] transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Skills */}
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
          <div className="border-b border-[#2a2a2a] px-5 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Current Skills</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. React, Python, SQL…"
                className={inputClass}
              />
              <button
                onClick={addSkill}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:border-[#3a3a3a] transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            {userSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {userSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-slate-300">
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-slate-600 hover:text-slate-300 transition">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {userSkills.length === 0 && (
              <p className="text-xs text-slate-600">No skills added — AI will assume you're starting from scratch.</p>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-red-400 px-1">{error}</p>}

        <button
          onClick={analyze}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing with AI…</>
          ) : (
            <><Target className="h-4 w-4" /> Analyze Skill Gap</>
          )}
        </button>
      </div>
    </div>
  );

  // ── RESULT SCREEN ────────────────────────────────────────────────
  const { role, company } = parseTarget(targetInput);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Topbar */}
      <div className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
            ← New Analysis
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <Target className="h-3.5 w-3.5 text-slate-600" />
            <span>{role}</span>
            <span className="text-[#2a2a2a]">·</span>
            <span>{company}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-1">
            <span className="text-xs font-semibold text-green-400">{result.readinessPercent}% Ready</span>
          </div>
          <div className="rounded-md border border-[#2a2a2a] bg-[#141414] px-3 py-1">
            <span className="text-xs font-semibold text-red-400">{result.overallGapPercent}% Gap</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">

        {/* Summary card */}
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
          <div className="border-b border-[#2a2a2a] px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Assessment</span>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-slate-400 leading-relaxed">{result.summary}</p>

            {/* Readiness bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium">Overall Readiness</span>
                <span className="text-slate-300 font-semibold">{result.readinessPercent}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${result.readinessPercent}%`,
                    background: result.readinessPercent >= 70
                      ? "linear-gradient(90deg,#16a34a,#4ade80)"
                      : result.readinessPercent >= 40
                      ? "linear-gradient(90deg,#d97706,#fbbf24)"
                      : "linear-gradient(90deg,#dc2626,#f87171)",
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>0%</span>
                <span className="text-slate-500">Target: 100%</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {[
                { icon: CheckCircle2, label: "Skills Met",    value: result.userSkillScores?.filter(s => s.score >= s.required).length || 0, color: "text-green-400" },
                { icon: AlertCircle,  label: "Gaps to Close", value: result.missingSkills?.length || 0,                                       color: "text-red-400" },
                { icon: Clock,        label: "Est. Weeks",    value: result.learningPath?.reduce((a, s) => a + parseInt(s.duration) || 0, 0) || "8+", color: "text-indigo-400" },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-3 text-center">
                  <s.icon className={`h-4 w-4 mx-auto mb-1.5 ${s.color}`} />
                  <div className="text-sm font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1a1a1a] gap-1">
          {[
            { id: "skills",   icon: BarChart2,   label: "Skill Bars" },
            { id: "radar",    icon: Target,       label: "Radar Chart" },
            { id: "missing",  icon: AlertCircle,  label: `Missing (${result.missingSkills?.length || 0})` },
            { id: "path",     icon: BookOpen,     label: "Learning Path" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                activeTab === t.id
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* SKILL BARS */}
        {activeTab === "skills" && (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
            <div className="border-b border-[#2a2a2a] px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills vs Required</span>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-4 rounded-full bg-indigo-500" /> You</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-0.5 bg-[#3a3a3a]" /> Required</span>
              </div>
            </div>
            <div className="p-5 space-y-5">
              {result.userSkillScores?.map(skill => (
                <SkillBar key={skill.name} {...skill} />
              ))}
            </div>
          </div>
        )}

        {/* RADAR CHART */}
        {activeTab === "radar" && (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
            <div className="border-b border-[#2a2a2a] px-5 py-3.5 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Competency Radar</span>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-indigo-500/40 border border-indigo-500" /> Required</span>
                <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-3 rounded-sm bg-slate-500/20 border border-slate-500" /> Current</span>
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={result.radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#2a2a2a" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                  />
                  <Radar
                    name="Required"
                    dataKey="required"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#475569"
                    fill="#475569"
                    fillOpacity={0.1}
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>

              {/* Per-category gap summary */}
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {result.radarData?.map(d => {
                  const gap = d.required - d.current;
                  return (
                    <div key={d.subject} className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2.5">
                      <p className="text-xs font-semibold text-slate-300 mb-1">{d.subject}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{d.current}% / {d.required}%</span>
                        {gap > 0
                          ? <span className="text-red-400">-{gap}%</span>
                          : <span className="text-green-400">✓</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MISSING SKILLS */}
        {activeTab === "missing" && (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
            <div className="border-b border-[#2a2a2a] px-5 py-3.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills to Acquire</span>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {result.missingSkills?.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No critical gaps — you're well qualified!</p>
                </div>
              )}
              {result.missingSkills?.map((skill, i) => {
                const p = PRIORITY_STYLE[skill.priority] || PRIORITY_STYLE.medium;
                return (
                  <div key={skill.name} className="flex items-center gap-4 px-5 py-4">
                    <span className="text-xs font-bold text-slate-600 w-4 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-slate-200">{skill.name}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${p.cls}`}>
                          {skill.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>Est. {skill.timeToLearn} to learn</span>
                      </div>
                    </div>
                    <div className={`h-2 w-2 rounded-full shrink-0 ${p.dot}`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LEARNING PATH */}
        {activeTab === "path" && (
          <div className="space-y-3">
            {result.learningPath?.map((step, i) => (
              <div key={step.step} className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
                <div className="border-b border-[#2a2a2a] px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#3a3a3a] bg-[#1a1a1a] text-xs font-bold text-indigo-400">{step.step}</span>
                    <span className="text-sm font-semibold text-slate-100">{step.title}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 border border-[#2a2a2a] bg-[#1a1a1a] px-2.5 py-1 rounded-lg">
                    <Clock className="h-3 w-3" /> {step.duration}
                  </span>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                  {step.resources?.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Resources</p>
                      {step.resources.map(r => (
                        <div key={r} className="flex items-center gap-2 text-xs text-slate-500">
                          <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Re-analyze CTA */}
        <button
          onClick={reset}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#141414] px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:border-[#3a3a3a] transition"
        >
          <Target className="h-4 w-4" /> Analyze a Different Role
        </button>
      </div>
    </div>
  );
}