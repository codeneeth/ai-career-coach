"use client";
import { useState, useEffect } from "react";
import {
  Code2, Compass, PenLine, BarChart2, Terminal,
  ChevronRight, CheckCircle2, Circle, Inbox, Send,
  ArrowLeft, Zap, Trophy, Star, Clock, TrendingUp,
  Shield, AlertCircle, Flame, Sparkles, Loader2,
  RefreshCw, Award, Mail, Users, Search, FlaskConical,
} from "lucide-react";
import { startSimulation, resolveChallenge, getEmailReply } from "@/actions/careerSimulation";

const CAREERS = [
  { role: "Software Engineer", icon: Code2,     companies: ["Y Combinator Startup", "FAANG Company", "Fintech Scaleup"] },
  { role: "Product Manager",   icon: Compass,   companies: ["SaaS Startup", "E-commerce Giant", "HealthTech Company"] },
  { role: "UI/UX Designer",    icon: PenLine,   companies: ["Design Agency", "Consumer App Startup", "Gaming Studio"] },
  { role: "Data Scientist",    icon: BarChart2, companies: ["AI Research Lab", "Hedge Fund", "Retail Analytics Firm"] },
  { role: "DevOps Engineer",   icon: Terminal,  companies: ["Cloud Infrastructure Startup", "Banking Enterprise", "Media Platform"] },
];

const TASK_ICONS = { code: Code2, meeting: Users, review: Search, design: PenLine, research: FlaskConical, email: Mail };

const PRIORITY = {
  high:   { label: "High",   cls: "text-red-400 bg-red-400/10 border border-red-400/20" },
  medium: { label: "Medium", cls: "text-yellow-400 bg-yellow-400/10 border border-yellow-400/20" },
  low:    { label: "Low",    cls: "text-green-400 bg-green-400/10 border border-green-400/20" },
};

const inputClass =
  "w-full rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-900";

// Typewriter
function Typewriter({ text }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => { i++; setOut(text.slice(0, i)); if (i >= text.length) clearInterval(id); }, 16);
    return () => clearInterval(id);
  }, [text]);
  return <span>{out}</span>;
}

export default function CareerSimulator() {
  const [screen, setScreen]           = useState("select");
  const [selectedCareer, setCareer]   = useState(null);
  const [selectedCompany, setCompany] = useState(null);
  const [day, setDay]                 = useState(1);
  const [simData, setSimData]         = useState(null);
  const [totalXp, setTotalXp]         = useState(0);
  const [sessionXp, setSessionXp]     = useState(0);
  const [tab, setTab]                 = useState("tasks");
  const [doneTasks, setDoneTasks]     = useState([]);
  const [chDone, setChDone]           = useState(false);
  const [chResult, setChResult]       = useState(null);
  const [choosing, setChoosing]       = useState(null);
  const [openEmail, setOpenEmail]     = useState(null);
  const [reply, setReply]             = useState("");
  const [emailResult, setEmailResult] = useState(null);
  const [replying, setReplying]       = useState(false);

  const addXp = (n) => { setTotalXp(p => p + n); setSessionXp(p => p + n); };

  const launch = async (d = day) => {
    if (!selectedCareer || !selectedCompany) return;
    setScreen("loading");
    setSessionXp(0); setDoneTasks([]); setChDone(false); setChResult(null);
    setOpenEmail(null); setEmailResult(null); setTab("tasks");
    try {
      const data = await startSimulation({ role: selectedCareer.role, company: selectedCompany, day: d });
      setSimData(data);
      setScreen("sim");
    } catch {
      alert("Gemini error — check your API key");
      setScreen("select");
    }
  };

  const pickOption = async (opt) => {
    setChoosing(opt.id);
    try {
      const res = await resolveChallenge({ role: selectedCareer.role, company: selectedCompany, challenge: simData.challenge.scenario, choiceId: opt.id, choiceText: opt.text });
      addXp(res.xpGained || 50);
      setChResult(res); setChDone(true);
    } finally { setChoosing(null); }
  };

  const completeTask = (id) => { if (doneTasks.includes(id)) return; setDoneTasks(p => [...p, id]); addXp(30); };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setReplying(true);
    try {
      const res = await getEmailReply({ role: selectedCareer.role, emailBody: openEmail.body, userReply: reply });
      setEmailResult(res); addXp(20);
    } finally { setReplying(false); }
  };

  const nextDay = () => { const nd = day + 1; setDay(nd); launch(nd); };
  const reset   = () => { setDay(1); setTotalXp(0); setScreen("select"); };

  // ── SELECT ───────────────────────────────────────
  if (screen === "select") return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#141414] px-4 py-1.5 mb-5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">AI Career Simulation</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Career Simulation Mode</h1>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Step into a role and face real tasks, emails, and decisions — powered by Gemini AI.
          </p>
        </div>

        {/* Role selection */}
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden mb-3">
          <div className="border-b border-[#2a2a2a] px-5 py-3.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Choose your role</p>
          </div>
          <div className="p-4 grid grid-cols-1 gap-2">
            {CAREERS.map(c => {
              const active = selectedCareer?.role === c.role;
              return (
                <button
                  key={c.role}
                  onClick={() => { setCareer(c); setCompany(null); }}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                    active
                      ? "border-indigo-600 bg-indigo-600/10 text-white"
                      : "border-[#2a2a2a] bg-[#1a1a1a] text-slate-400 hover:border-[#3a3a3a] hover:text-slate-300"
                  }`}
                >
                  <c.icon className={`h-4 w-4 shrink-0 ${active ? "text-indigo-400" : "text-slate-600"}`} />
                  <span className="text-sm font-medium">{c.role}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-indigo-400 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Company selection */}
        {selectedCareer && (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden mb-3">
            <div className="border-b border-[#2a2a2a] px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Choose your company</p>
            </div>
            <div className="p-4 grid grid-cols-1 gap-2">
              {selectedCareer.companies.map(co => {
                const active = selectedCompany === co;
                return (
                  <button
                    key={co}
                    onClick={() => setCompany(co)}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                      active
                        ? "border-indigo-600 bg-indigo-600/10 text-white"
                        : "border-[#2a2a2a] bg-[#1a1a1a] text-slate-400 hover:border-[#3a3a3a] hover:text-slate-300"
                    }`}
                  >
                    <span className="text-sm font-medium">{co}</span>
                    {active && <ChevronRight className="h-3.5 w-3.5 text-indigo-400 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={() => launch()}
          disabled={!selectedCareer || !selectedCompany}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
        >
          Start Simulation — Day {day}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // ── LOADING ──────────────────────────────────────
  if (screen === "loading") return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Generating your workday…</p>
      </div>
    </div>
  );

  // ── RESULT ───────────────────────────────────────
  if (screen === "result") return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
          <div className="border-b border-[#2a2a2a] px-6 py-5 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] mb-3">
              <Trophy className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Day {day} Complete</h2>
            <p className="text-xs text-slate-500 mt-0.5">{selectedCareer.role} · {selectedCompany}</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle2, label: "Tasks", value: `${doneTasks.length}/${simData?.tasks?.length || 3}` },
                { icon: Flame,        label: "Challenge", value: chDone ? "Solved" : "Skipped" },
                { icon: Zap,          label: "XP Earned", value: `+${sessionXp}` },
              ].map(s => (
                <div key={s.label} className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-3 text-center">
                  <s.icon className="h-4 w-4 text-indigo-400 mx-auto mb-1.5" />
                  <div className="text-sm font-bold text-white">{s.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* XP bar */}
            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total XP</span>
                <span className="text-xs text-slate-400">{totalXp} / 500</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#2a2a2a] overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-700" style={{ width: `${Math.min((totalXp / 500) * 100, 100)}%` }} />
              </div>
            </div>

            {chResult?.lesson && (
              <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 flex gap-2.5 items-start">
                <Star className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed italic">{chResult.lesson}</p>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition">
                <RefreshCw className="h-3.5 w-3.5" /> New Role
              </button>
              <button onClick={nextDay} className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition">
                Day {day + 1} <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── SIM ─────────────────────────────────────────
  const RoleIcon = selectedCareer?.icon || Code2;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      <div className="sticky top-0 z-50 border-b border-[#1a1a1a] bg-[#0a0a0a]/95 backdrop-blur px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("select")} className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Exit
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500">
            <RoleIcon className="h-3.5 w-3.5 text-slate-600" />
            <span>{selectedCareer.role}</span>
            <span className="text-[#2a2a2a]">·</span>
            <span>{selectedCompany}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-indigo-400" />
            <div className="w-24 h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-700" style={{ width: `${Math.min((totalXp / 500) * 100, 100)}%` }} />
            </div>
            <span className="text-xs text-slate-500">{totalXp}</span>
          </div>
          <div className="rounded-md border border-[#2a2a2a] bg-[#141414] px-2.5 py-1">
            <span className="text-xs font-semibold text-slate-300">Day {day}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-5 py-3.5">
            <Clock className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Morning Briefing</span>
          </div>
          <div className="px-5 py-4">
            <h2 className="text-base font-bold text-white mb-2">{simData.dayTitle}</h2>
            <p className="text-sm text-slate-400 leading-relaxed"><Typewriter text={simData.briefing} /></p>
          </div>
        </div>

        <div className="flex border-b border-[#1a1a1a] gap-1">
          {[
            { id: "tasks",     icon: CheckCircle2, label: `Tasks (${doneTasks.length}/${simData.tasks.length})` },
            { id: "emails",    icon: Inbox,        label: `Inbox (${simData.emails.length})` },
            { id: "challenge", icon: Flame,        label: chDone ? "Challenge ✓" : "Challenge" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition -mb-px ${
                tab === t.id
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "tasks" && (
          <div className="space-y-3">
            {simData.tasks.map(task => {
              const isDone = doneTasks.includes(task.id);
              const TIcon = TASK_ICONS[task.type] || Code2;
              const p = PRIORITY[task.priority] || PRIORITY.medium;
              return (
                <div key={task.id} className={`rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden transition ${isDone ? "opacity-50" : ""}`}>
                  <div className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
                        <TIcon className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-semibold text-slate-100 ${isDone ? "line-through text-slate-500" : ""}`}>{task.title}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${p.cls}`}>{p.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-3">{task.description}</p>
                        {isDone ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completed · +30 XP
                          </div>
                        ) : (
                          <button onClick={() => completeTask(task.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-[#3a3a3a] transition">
                            <Circle className="h-3.5 w-3.5" /> Mark complete · +30 XP
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "emails" && (
          !openEmail ? (
            <div className="space-y-3">
              {simData.emails.map(email => (
                <button key={email.id} onClick={() => { setOpenEmail(email); setReply(""); setEmailResult(null); }}
                  className="w-full rounded-2xl border border-[#2a2a2a] bg-[#141414] px-5 py-4 text-left hover:border-[#3a3a3a] transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-500">{email.from}</span>
                    {email.urgent && <span className="text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded">Urgent</span>}
                  </div>
                  <div className="text-sm font-semibold text-slate-100 mb-1">{email.subject}</div>
                  <div className="text-xs text-slate-500 truncate">{email.preview}</div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <button onClick={() => setOpenEmail(null)} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-300 transition">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to inbox
              </button>

              <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
                <div className="border-b border-[#2a2a2a] px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">From: {openEmail.from}</p>
                    <p className="text-sm font-semibold text-slate-100">{openEmail.subject}</p>
                  </div>
                  {openEmail.urgent && <span className="text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded">Urgent</span>}
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm text-slate-400 leading-relaxed">{openEmail.body}</p>
                </div>
              </div>

              {!emailResult ? (
                <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
                  <div className="border-b border-[#2a2a2a] px-5 py-3.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Your Reply</p>
                  </div>
                  <div className="p-5 space-y-3">
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      placeholder="Type your professional reply..."
                      rows={4}
                      className={`${inputClass} resize-none`}
                    />
                    <div className="flex justify-end">
                      <button onClick={sendReply} disabled={replying} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition disabled:opacity-50">
                        {replying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        {replying ? "Sending…" : "Send Reply · +20 XP"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
                  <div className="border-b border-[#2a2a2a] px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${emailResult.tone === "positive" ? "bg-green-400" : emailResult.tone === "negative" ? "bg-red-400" : "bg-yellow-400"}`} />
                      <span className="text-xs font-semibold text-slate-500 capitalize">{emailResult.tone} response</span>
                    </div>
                    <span className="text-xs font-semibold text-green-400">+20 XP</span>
                  </div>
                  <div className="px-5 py-4 space-y-3">
                    <p className="text-sm text-slate-400 leading-relaxed">{emailResult.reply}</p>
                    <div className="flex gap-2.5 items-start pt-2 border-t border-[#1a1a1a]">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-slate-500 leading-relaxed">{emailResult.tip}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {tab === "challenge" && (
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#2a2a2a] px-5 py-3.5">
              <Flame className="h-3.5 w-3.5 text-slate-600" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Critical Decision</span>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white mb-1.5">{simData.challenge.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{simData.challenge.scenario}</p>
              </div>

              {!chDone ? (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">How do you respond?</p>
                  {simData.challenge.options.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => pickOption(opt)}
                      disabled={!!choosing}
                      className={`w-full flex items-start gap-3 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 text-left transition hover:border-[#3a3a3a] hover:bg-[#222] disabled:opacity-40 ${choosing === opt.id ? "border-indigo-600/40 bg-indigo-600/5" : ""}`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#3a3a3a] bg-[#2a2a2a] text-xs font-bold text-slate-400 mt-0.5">
                        {choosing === opt.id ? <Loader2 className="h-3 w-3 animate-spin" /> : opt.id.toUpperCase()}
                      </span>
                      <span className="text-sm text-slate-300 leading-relaxed">{opt.text}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`rounded-lg border px-4 py-4 space-y-3 ${
                  chResult.consequence === "good"    ? "border-green-400/20 bg-green-400/5" :
                  chResult.consequence === "bad"     ? "border-red-400/20 bg-red-400/5" :
                                                       "border-[#2a2a2a] bg-[#1a1a1a]"
                }`}>
                  <div className="flex items-center justify-between">
                    {chResult.consequence === "good"    ? <TrendingUp className="h-4 w-4 text-green-400" /> :
                     chResult.consequence === "bad"     ? <AlertCircle className="h-4 w-4 text-red-400" /> :
                                                          <Shield className="h-4 w-4 text-slate-400" />}
                    <span className="text-xs font-semibold text-green-400">+{chResult.xpGained} XP</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{chResult.outcome}</p>
                  <p className="text-xs text-slate-500 border-t border-[#2a2a2a] pt-3">
                    <span className="font-semibold text-slate-400">Manager: </span>"{chResult.managerReaction}"
                  </p>
                  <div className="flex gap-2 items-start">
                    <Star className="h-3.5 w-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-slate-500 italic leading-relaxed">{chResult.lesson}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <button onClick={() => setScreen("result")} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 active:scale-95 transition">
          <Award className="h-4 w-4" />
          End Day {day} — View Results
        </button>
      </div>
    </div>
  );
}