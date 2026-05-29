'use client';
export const dynamic = 'force-dynamic';

import * as React from 'react';
import { Button, Badge, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent, EmptyState } from '@openmoney/ui';
import { Bot, Send, Sparkles, Zap, Brain, ArrowRight, Globe, TrendingUp, ShieldAlert, Lightbulb, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const AGENTS = [
  { id: 'buffett', name: 'Warren Buffett', category: 'Value Investing', avatar: 'WB', color: 'bg-blue-500/10 text-blue-400' },
  { id: 'graham', name: 'Benjamin Graham', category: 'Deep Value', avatar: 'BG', color: 'bg-amber-500/10 text-amber-400' },
  { id: 'lynch', name: 'Peter Lynch', category: 'Growth at Reasonable Price', avatar: 'PL', color: 'bg-emerald-500/10 text-emerald-400' },
  { id: 'dailo', name: 'Ray Dalio', category: 'Macro & All Weather', avatar: 'RD', color: 'bg-purple-500/10 text-purple-400' },
  { id: 'taleb', name: 'Nassim Taleb', category: 'Risk & Black Swans', avatar: 'NT', color: 'bg-red-500/10 text-red-400' },
  { id: 'simons', name: 'Jim Simons', category: 'Quantitative', avatar: 'JS', color: 'bg-cyan-500/10 text-cyan-400' },
  { id: 'oneil', name: 'William O\'Neil', category: 'CAN SLIM Growth', avatar: 'WO', color: 'bg-orange-500/10 text-orange-400' },
  { id: 'marks', name: 'Howard Marks', category: 'Distressed/Cyclical', avatar: 'HM', color: 'bg-pink-500/10 text-pink-400' },
];

interface Message { role: 'user' | 'agent'; content: string; agent?: string; timestamp: string; }

export default function AIPage() {
  const [messages, setMessages] = React.useState<Message[]>([
    { role: 'agent', content: 'Welcome to the AI Analysis Suite. I can deploy specialized investment agents to analyze any ticker, portfolio, or market condition. What would you like to analyze?', agent: 'System', timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = React.useState('');
  const [processing, setProcessing] = React.useState(false);
  const [selectedAgents, setSelectedAgents] = React.useState<string[]>(['buffett', 'graham', 'taleb']);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const toggleAgent = (id: string) => {
    setSelectedAgents(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault(); if (!input.trim() || processing) return;
    const userMsg: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput(''); setProcessing(true);

    // Simulate agent analysis with streaming-like delays
    const tickerMatch = input.match(/\b[A-Z]{1,5}\b/g);
    const ticker = tickerMatch ? tickerMatch[0] : 'SPY';

    for (const agentId of selectedAgents) {
      const agent = AGENTS.find(a => a.id === agentId);
      if (!agent) continue;
      const responses: Record<string, string> = {
        buffett: `${ticker} analysis: Strong economic moat identified. Consistent free cash flow generation over the past 5 years. Management demonstrates excellent capital allocation. Intrinsic value appears to be above current market price. Verdict: Favorable long-term hold with 85% conviction.`,
        graham: `${ticker} deep value check: Current P/B ratio indicates moderate value. The margin of safety at current levels is approximately 15% below intrinsic value. I recommend waiting for a 25%+ margin of safety before establishing a full position. Verdict: Hold, accumulate on dips.`,
        taleb: `${ticker} risk analysis: Tail risk exposure sits at 2.3σ. Key vulnerabilities include sector concentration and regulatory exposure. Recommend implementing a barbell strategy: 80% in safe assets, 20% in high-upside positions. Consider out-of-the-money puts for tail hedging.`,
        dalio: `${ticker} macro view: Current position within the economic cycle suggests moderate growth ahead. Inflation expectations are well-anchored. The debt cycle remains in the expansion phase. Verdict: Structurally positive with 70% confidence.`,
        lynch: `${ticker} GARP analysis: PEG ratio at 1.2x suggests fair valuation relative to growth. Revenue growth is outpacing the industry average by 3 percentage points. Institutional ownership is increasing. Verdict: Compelling growth story — initiate position scaling in over 4-6 weeks.`,
        simons: `${ticker} quant signal: 50-day MA crossing above 200-day MA (golden cross confirmed). RSI at 58 — not overbought. MACD histogram showing bullish divergence. Mean reversion probability at 62%. Verdict: Statistically favorable entry with 71% confidence interval.`,
        oneil: `${ticker} CAN SLIM scan: EPS growth of 28% YoY exceeds the 25% threshold. RS Rating of 82 indicates strong relative strength. Accumulation/Distribution rating is A-. Chart pattern shows cup-with-handle formation. Verdict: Strong technical + fundamental picture — buy signal active.`,
        marks: `${ticker} cyclical analysis: Currently in the mid-cycle expansion phase. Credit spreads are tight, suggesting market confidence. However, we're closer to the top of the cycle than the bottom. Verdict: Position sizing should be conservative. Prepare for eventual cycle turn.`,
      };
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      const agentMsg: Message = { role: 'agent', content: responses[agentId] ?? `Analysis for ${ticker} from ${agent.name}.`, agent: agent.name, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, agentMsg]);
    }

    // Consensus summary
    await new Promise(r => setTimeout(r, 400));
    const consensusMsg: Message = {
      role: 'agent',
      content: `**Consensus on ${ticker}**: ${selectedAgents.length} agents analyzed. Overall sentiment leans cautiously bullish with an average conviction of 73%. Key themes: valuation is reasonable, growth trajectory intact, monitor tail risks closely. Suggested action: accumulate on pullbacks with defined risk parameters.`,
      agent: 'Consensus',
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, consensusMsg]);
    setProcessing(false);
  };

  return (
    <div className="flex h-full">
      {/* Agent Sidebar */}
      <aside className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface-1)] flex flex-col">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] mb-3">Analyst Agents</h2>
          <p className="text-xs text-[var(--text-secondary)]">Select agents to analyze your ticker. Each agent provides a unique perspective.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {AGENTS.map(a => (
            <button key={a.id} onClick={() => toggleAgent(a.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all ${selectedAgents.includes(a.id) ? 'bg-[var(--accent)] ring-1 ring-[var(--ring)]/20' : 'hover:bg-[var(--surface-2)]'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-md text-xs font-mono font-bold shrink-0 ${selectedAgents.includes(a.id) ? a.color.replace('/10', '/30') : a.color}`}>{a.avatar}</div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[var(--text-primary)] truncate">{a.name}</p>
                <p className="font-mono text-[9px] text-[var(--text-tertiary)] truncate">{a.category}</p>
              </div>
              {selectedAgents.includes(a.id) && <div className="ml-auto shrink-0 w-2 h-2 rounded-full bg-[var(--positive)]" />}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-[var(--border)]">
          <p className="font-mono text-[9px] text-[var(--text-tertiary)] text-center">{selectedAgents.length} of {AGENTS.length} agents active</p>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--brand)]/10"><Bot size={14} className="text-[var(--brand)]" /></div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">AI Analysis Suite</p>
              <p className="font-mono text-[9px] text-[var(--text-tertiary)]">Multi-agent consensus engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {processing && <span className="flex items-center gap-1.5 font-mono text-[10px] text-[var(--brand)]"><Loader2 size={10} className="animate-spin" /> Analyzing...</span>}
            <Button variant="ghost" size="sm"><RefreshCw size={13} /></Button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'agent' && (
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[var(--brand)]/10 shrink-0">
                  <Bot size={13} className="text-[var(--brand)]" />
                </div>
              )}
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                {msg.agent && (
                  <p className={`font-mono text-[9px] mb-1 ${msg.agent === 'Consensus' ? 'text-[var(--brand)]' : 'text-[var(--text-tertiary)]'}`}>
                    {msg.agent} {msg.agent !== 'System' && msg.agent !== 'Consensus' && <span className="text-[var(--text-tertiary)]">· Agent Analysis</span>}
                  </p>
                )}
                <div className={`rounded-lg px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-[var(--foreground)] text-[var(--background)]' : 'bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border-subtle)]'}`}>
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
                <p className="font-mono text-[9px] text-[var(--text-tertiary)] mt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
          {processing && (
            <div className="flex items-center gap-2 px-3 py-2">
              <Loader2 size={14} className="animate-spin text-[var(--brand)]" />
              <span className="font-mono text-[10px] text-[var(--text-tertiary)]">Agents analyzing... {selectedAgents.map(id => AGENTS.find(a => a.id === id)?.name).filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-[var(--border)] shrink-0">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask the agents about any ticker, portfolio, or market condition (e.g., 'Analyze AAPL' or 'Check my portfolio risk')..."
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] pl-10 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[var(--brand-border)] transition-colors" disabled={processing} />
              <Bot size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            </div>
            <Button type="submit" size="sm" disabled={processing || !input.trim()} className="h-10 px-5">
              {processing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </Button>
          </div>
          <p className="mt-2 text-center font-mono text-[9px] text-[var(--text-tertiary)]">
            Powered by multi-agent consensus analysis · {selectedAgents.length} agents selected
          </p>
        </form>
      </div>
    </div>
  );
}
