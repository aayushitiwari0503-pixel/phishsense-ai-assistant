"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Link as LinkIcon, 
  MessageSquare, 
  Lock, 
  Eye, 
  EyeOff,
  ChevronDown,
  Globe,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// --- Mock Detection Logic ---
const PHISHING_KEYWORDS = [
  "urgent", "action required", "verify your account", "unusual activity", 
  "password reset", "limited time", "immediate attention", "suspend", 
  "unauthorized access", "click here", "gift card", "lottery", "prize",
  "bank", "paypal", "microsoft", "amazon", "google", "apple", "netflix"
];

const SUSPICIOUS_INDICATORS = [
  "Sense of Urgency",
  "Impersonation of Brands",
  "Suspicious Links",
  "Generic Greetings",
  "Poor Grammar/Spelling",
  "Request for Personal Info"
];

const analyzeContent = (text: string, url: string) => {
  const combined = (text + " " + url).toLowerCase();
  let score = 0;
  const indicators: string[] = [];

  // Basic keyword detection
  PHISHING_KEYWORDS.forEach(kw => {
    if (combined.includes(kw.toLowerCase())) {
      score += 15;
    }
  });

  // Specific patterns
  if (combined.includes("urgent") || combined.includes("immediate")) indicators.push("Sense of Urgency");
  if (combined.includes("verify") || combined.includes("account")) indicators.push("Impersonation of Brands");
  if (url && (url.includes("bit.ly") || url.includes("tinyurl") || !url.startsWith("https"))) indicators.push("Suspicious Links");
  if (combined.includes("dear customer") || combined.includes("valued user")) indicators.push("Generic Greetings");
  if (combined.includes("password") || combined.includes("credit card") || combined.includes("ssn")) indicators.push("Request for Personal Info");

  // Determine status
  let status: "Safe" | "Suspicious" | "Dangerous" = "Safe";
  if (score > 60 || indicators.length >= 3) status = "Dangerous";
  else if (score > 20 || indicators.length >= 1) status = "Suspicious";

  // Risk Level
  const riskScore = Math.min(score + (indicators.length * 10), 100);

  return { status, riskScore, indicators };
};

// --- Components ---

const RiskIndicator = ({ status, score }: { status: "Safe" | "Suspicious" | "Dangerous", score: number }) => {
  const colors = {
    Safe: "bg-emerald-500",
    Suspicious: "bg-amber-500",
    Dangerous: "bg-rose-500"
  };

  const icons = {
    Safe: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
    Suspicious: <ShieldAlert className="w-8 h-8 text-amber-500" />,
    Dangerous: <ShieldX className="w-8 h-8 text-rose-500" />
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-zinc-900/50 rounded-2xl border border-white/10">
      <div className="relative">
        <div className={`absolute inset-0 blur-2xl opacity-20 ${colors[status]}`} />
        <div className="relative bg-black/50 p-4 rounded-full border border-white/10">
          {icons[status]}
        </div>
      </div>
      <div className="text-center">
        <h3 className={`text-2xl font-bold ${status === 'Safe' ? 'text-emerald-400' : status === 'Suspicious' ? 'text-amber-400' : 'text-rose-400'}`}>
          {status}
        </h3>
        <p className="text-zinc-400 text-sm mt-1">Risk Level: {score}%</p>
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          className={`h-full ${colors[status]}`}
        />
      </div>
    </div>
  );
};

export default function PhishSenseApp() {
  const [isLanding, setIsLanding] = useState(true);
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof analyzeContent> | null>(null);
  const [explainMode, setExplainMode] = useState<"normal" | "eli12">("normal");

  const handleAnalyze = () => {
    if (!inputText && !inputUrl) return;
    setIsAnalyzing(true);
    // Simulate AI delay
    setTimeout(() => {
      const res = analyzeContent(inputText, inputUrl);
      setResult(res);
      setIsAnalyzing(false);
    }, 1500);
  };

  const reset = () => {
    setResult(null);
    setInputText("");
    setInputUrl("");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsLanding(true)}>
            <div className="bg-emerald-500 p-1.5 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight">PhishSense<span className="text-emerald-500">AI</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setIsLanding(true)}>How it works</Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-6"
              onClick={() => setIsLanding(false)}
            >
              Analyze Message
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {isLanding ? (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-12 md:py-24"
            >
              <Badge variant="outline" className="mb-6 border-emerald-500/30 text-emerald-400 py-1 px-4 bg-emerald-500/5">
                Cybersecurity for Humans
              </Badge>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-8 leading-[1.1]">
                Stop Phishing Before It <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  Stops Your Day.
                </span>
              </h1>
              <p className="text-zinc-400 text-xl max-w-2xl mb-12 leading-relaxed">
                Most security tools are made for IT experts. PhishSense AI is made for you. 
                Instantly check emails, texts, and links for hidden dangers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-20">
                <Button 
                  size="lg" 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-lg px-8 py-7 rounded-2xl h-auto"
                  onClick={() => setIsLanding(false)}
                >
                  Start Scanning Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/10 hover:bg-white/5 text-lg px-8 py-7 rounded-2xl h-auto"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Problem Section */}
              <div className="grid md:grid-cols-3 gap-8 w-full">
                {[
                  {
                    icon: <Zap className="w-6 h-6 text-emerald-400" />,
                    title: "Instant Analysis",
                    desc: "Paste any message and get a risk score in seconds using advanced AI logic."
                  },
                  {
                    icon: <Info className="w-6 h-6 text-cyan-400" />,
                    title: "Human Language",
                    desc: "No technical jargon. We explain exactly why a message is risky in simple terms."
                  },
                  {
                    icon: <Lock className="w-6 h-6 text-purple-400" />,
                    title: "Safety First",
                    desc: "Clear actionable steps on what to do next to protect your accounts."
                  }
                ].map((feature, i) => (
                  <Card key={i} className="bg-zinc-900/50 border-white/5 backdrop-blur-sm hover:border-emerald-500/20 transition-all group">
                    <CardHeader>
                      <div className="bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 transition-colors">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                      <CardDescription className="text-zinc-400 leading-relaxed">
                        {feature.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold">Analysis Center</h2>
                  <p className="text-zinc-400">Paste your suspicious communication below.</p>
                </div>
                {result && (
                  <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={reset}>
                    Clear and Start Over
                  </Button>
                )}
              </div>

              {!result ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Email or Message Content</Label>
                    <Textarea 
                      placeholder="Paste the email body or SMS message here..." 
                      className="min-h-[200px] bg-zinc-900/50 border-white/10 focus:border-emerald-500/50 transition-all text-lg"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Suspicious URL (Optional)</Label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input 
                        placeholder="https://example.com/verify-account" 
                        className="pl-10 bg-zinc-900/50 border-white/10 focus:border-emerald-500/50 transition-all"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full py-8 text-xl font-bold bg-emerald-600 hover:bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-900/20 group h-auto"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!inputText && !inputUrl)}
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-3">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Search className="w-6 h-6" />
                        </motion.div>
                        AI Analyzing Security Indicators...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Scan for Threats
                        <Zap className="w-5 h-5 group-hover:fill-current" />
                      </span>
                    )}
                  </Button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                    <p className="text-sm text-zinc-500 col-span-full">Try these examples:</p>
                    <button 
                      onClick={() => setInputText("Urgent: Your account has been suspended. Click here to verify your identity immediately or your funds will be lost.")}
                      className="text-left p-4 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-emerald-500/30 transition-all text-sm group"
                    >
                      <span className="text-zinc-300 group-hover:text-emerald-400 block font-medium mb-1">Suspicious Email</span>
                      <span className="text-zinc-500 line-clamp-1">Urgent: Your account has been suspended...</span>
                    </button>
                    <button 
                      onClick={() => setInputText("Hi Mom, just checking in to see if you're coming over for dinner on Sunday. Let me know!")}
                      className="text-left p-4 rounded-xl bg-zinc-900/30 border border-white/5 hover:border-emerald-500/30 transition-all text-sm group"
                    >
                      <span className="text-zinc-300 group-hover:text-emerald-400 block font-medium mb-1">Safe Message</span>
                      <span className="text-zinc-500 line-clamp-1">Hi Mom, just checking in to see if you're...</span>
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-900/30 rounded-xl border border-white/5 flex items-start gap-4">
                    <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-400 italic">
                      Tip: You can paste the entire header or just the main message. Our AI will filter through the noise to find suspicious patterns.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-12 gap-8">
                  <div className="md:col-span-4 space-y-6">
                    <RiskIndicator status={result.status} score={result.riskScore} />
                    
                    <Card className="bg-zinc-900/50 border-white/10">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Detected Indicators</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {result.indicators.length > 0 ? result.indicators.map((indicator, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                              <span>{indicator}</span>
                            </div>
                          )) : (
                            <div className="flex items-center gap-2 text-sm text-emerald-400">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>No common patterns found</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="md:col-span-8 space-y-6">
                    <Card className="bg-zinc-900/50 border-white/10 overflow-hidden">
                      <div className="bg-zinc-800/50 px-6 py-4 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-emerald-400" />
                          <h3 className="font-bold">AI Explanation</h3>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 p-1 rounded-lg">
                          <button 
                            onClick={() => setExplainMode("normal")}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${explainMode === 'normal' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Normal
                          </button>
                          <button 
                            onClick={() => setExplainMode("eli12")}
                            className={`px-3 py-1 text-xs rounded-md transition-all ${explainMode === 'eli12' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Explain Like I'm 12
                          </button>
                        </div>
                      </div>
                      <CardContent className="pt-6">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={explainMode}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="text-lg leading-relaxed text-zinc-300"
                          >
                            {explainMode === "normal" ? (
                              <div className="space-y-4">
                                {result.status === "Safe" ? (
                                  <p>This message appears to be legitimate based on standard communication patterns. No known phishing signatures or suspicious links were identified in the content provided.</p>
                                ) : (
                                  <>
                                    <p>Our analysis has identified several high-risk elements in this communication. The message uses <span className="text-rose-400 font-medium">manipulative language</span> designed to trigger an emotional response.</p>
                                    <p>The primary concern is the {result.indicators.join(" and ")}. This is a classic tactic used by attackers to bypass logical thinking and force a quick mistake.</p>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4 italic text-zinc-200">
                                {result.status === "Safe" ? (
                                  <p>"This looks like a normal message from a friend or a real company. It doesn't have any of the 'sneaky tricks' that bad people use to steal things."</p>
                                ) : (
                                  <>
                                    <p>"Imagine someone wearing a mask pretending to be your principal. They are shouting 'Hurry up!' so you don't look closely at their mask."</p>
                                    <p>"They want you to click a button or give them a secret password. But remember: real companies will never yell at you to do something right this second."</p>
                                  </>
                                )}
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </CardContent>
                    </Card>

                    <Card className="bg-emerald-950/10 border-emerald-500/20">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          What Should I Do Next?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-4">
                          {result.status === "Safe" ? (
                            <>
                              <li className="flex gap-3">
                                <div className="bg-emerald-500/20 p-1 rounded h-fit mt-1">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span>You can proceed, but always be cautious if they ask for payment or passwords.</span>
                              </li>
                            </>
                          ) : (
                            <>
                              <li className="flex gap-3">
                                <div className="bg-rose-500/20 p-1 rounded h-fit mt-1">
                                  <XCircle className="w-4 h-4 text-rose-400" />
                                </div>
                                <div className="space-y-1">
                                  <span className="font-bold block">Do NOT click any links</span>
                                  <span className="text-zinc-400 text-sm">Hover your mouse over links to see where they really go without clicking.</span>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="bg-amber-500/20 p-1 rounded h-fit mt-1">
                                  <Globe className="w-4 h-4 text-amber-400" />
                                </div>
                                <div className="space-y-1">
                                  <span className="font-bold block">Visit the official website directly</span>
                                  <span className="text-zinc-400 text-sm">Open a new tab and type the website address yourself instead of clicking the link.</span>
                                </div>
                              </li>
                              <li className="flex gap-3">
                                <div className="bg-zinc-500/20 p-1 rounded h-fit mt-1">
                                  <ShieldCheck className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className="space-y-1">
                                  <span className="font-bold block">Report this message</span>
                                  <span className="text-zinc-400 text-sm">Mark it as 'Spam' or 'Phishing' in your email app to help others.</span>
                                </div>
                              </li>
                            </>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span className="font-bold">PhishSense AI</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © 2025 PhishSense AI. Empowering non-technical users to stay safe online.
          </p>
          <div className="flex gap-6 text-zinc-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Security Guide</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
