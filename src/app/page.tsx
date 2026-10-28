
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import rules from "./rules.json";

type Rule = {
  intent: string;
  keywords: string[];
  reply: string;
};

type Message = {
  id: number;
  sender: "user" | "bot";
  text: string;
};

const chatbotRules = rules as Rule[];

const GREETING =
  "Assalam-o-Alaikum! 👋 Welcome to UOS Helpdesk Bot. Main University of Sargodha ke students ki madad ke liye yahan hoon. Admissions, fees, departments, exams, library, hostels ya student services ke bare mein poochiye.";

const FALLBACK =
  "Sorry, mujhe is sawal ka matching jawab nahi mila. Aap admissions, fees, departments, exams, library, hostels ya student services ke bare mein pooch sakte hain. Official details ke liye UOS portal visit karein.";

const PORTAL_URL = "https://portal.uos.edu.pk/";
const UNIVERSITY_URL = "https://www.uos.edu.pk/";

function normalizeMessage(message: string): string {
  return message
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getBotReply(message: string): string {
  const normalized = normalizeMessage(message);

  if (!normalized) {
    return "Please apna sawal type karein.";
  }

  const paddedMessage = ` ${normalized} `;
  let bestRule: Rule | null = null;
  let bestLength = 0;

  for (const rule of chatbotRules) {
    if (rule.intent === "fallback") continue;

    for (const keyword of rule.keywords) {
      const normalizedKeyword = normalizeMessage(keyword);

      if (!normalizedKeyword) continue;

      if (
        paddedMessage.includes(` ${normalizedKeyword} `) &&
        normalizedKeyword.length > bestLength
      ) {
        bestRule = rule;
        bestLength = normalizedKeyword.length;
      }
    }
  }

  return bestRule?.reply ?? FALLBACK;
}

const services = [
  {
    number: "01",
    title: "Admissions",
    description:
      "Explore admission guidance, eligibility, application procedures and merit lists.",
    icon: "🎓",
    question: "Admission process",
  },
  {
    number: "02",
    title: "Fees & Scholarships",
    description:
      "Find guidance about fee structures, challans and scholarship information.",
    icon: "💳",
    question: "Fee structure",
  },
  {
    number: "03",
    title: "Examinations",
    description:
      "Get guidance on exam schedules, date sheets, results and roll number slips.",
    icon: "📝",
    question: "Exam date sheet",
  },
  {
    number: "04",
    title: "Student Facilities",
    description:
      "Ask about library facilities, hostel applications and student services.",
    icon: "📚",
    question: "Library and hostel",
  },
];

const quickQuestions = [
  "Admission process",
  "Fee structure",
  "BS Media Studies",
  "Exam date sheet",
  "Hostel application",
  "Library card",
];

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text: GREETING,
    },
  ]);

  const nextId = useRef(2);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, chatOpen, isTyping]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function openChat(question?: string) {
    setChatOpen(true);

    if (question) {
      setInput(question);
    }

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }

  function sendMessage(event?: FormEvent<HTMLFormElement>, text?: string) {
    event?.preventDefault();

    const userText = (text ?? input).trim();

    if (!userText || isTyping) return;

    const userMessage: Message = {
      id: nextId.current++,
      sender: "user",
      text: userText,
    };

    const botMessage: Message = {
      id: nextId.current++,
      sender: "bot",
      text: getBotReply(userText),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsTyping(true);

    timerRef.current = setTimeout(() => {
      setMessages((previous) => [...previous, botMessage]);
      setIsTyping(false);
      timerRef.current = null;
    }, 300);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b16] text-white selection:bg-cyan-400/30">
      {/* Background effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -right-40 top-80 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#070b16]/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 font-black text-slate-950 shadow-lg shadow-cyan-500/15">
              U
            </div>

            <div>
              <p className="font-bold tracking-tight">UOS CONNECT</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">
                Student helpdesk
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-7 text-sm text-slate-400 md:flex">
            <a href="#home" className="transition hover:text-cyan-300">
              Home
            </a>
            <a href="#services" className="transition hover:text-cyan-300">
              Services
            </a>
            <a href="#assistant" className="transition hover:text-cyan-300">
              AI-style assistant
            </a>
            <a href="#links" className="transition hover:text-cyan-300">
              Student links
            </a>
          </div>

          <a
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-200 sm:text-sm"
          >
            Student Portal ↗
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section
        id="home"
        className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10"
      >
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-2 text-xs font-medium text-cyan-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
            YOUR UNIVERSITY. ONE SMARTER START.
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[1.08] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            University life,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
              made simpler.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Welcome to UOS Connect — your digital starting point for
            University of Sargodha information, student services and
            quick help whenever you need it.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openChat()}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 py-4 font-bold text-slate-950 shadow-xl shadow-cyan-500/15 transition hover:-translate-y-0.5 hover:shadow-cyan-400/25"
            >
              Chat with UOS Bot
              <span className="text-lg">↗</span>
            </button>

            <a
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 font-semibold transition hover:border-cyan-300/40 hover:bg-white/[0.08]"
            >
              Open University Portal
              <span>↗</span>
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="text-cyan-300">✓</span> No sign-up required
            </span>
            <span className="flex items-center gap-2">
              <span className="text-cyan-300">✓</span> English & Roman Urdu
            </span>
            <span className="flex items-center gap-2">
              <span className="text-cyan-300">✓</span> Quick guidance
            </span>
          </div>
        </div>

        {/* Decorative chatbot preview */}
        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-blue-500/20 to-cyan-300/5 blur-2xl" />

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d1424]/95 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-300 text-lg font-black text-slate-950">
                  U
                </div>
                <div>
                  <p className="font-bold">UOS Helpdesk Bot</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Student support assistant
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300">
                READY
              </span>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-xs leading-6 text-slate-300">
                  Assalam-o-Alaikum! 👋 Need help with university
                  information? I can guide you through common student
                  questions.
                </p>
              </div>

              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-blue-500/15 p-4">
                <p className="text-xs leading-6 text-cyan-100">
                  How can I find the admission information?
                </p>
              </div>

              <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-white/[0.08] bg-white/[0.04] p-4">
                <p className="text-xs leading-6 text-slate-300">
                  Check the latest official admission notice for eligibility,
                  required documents and deadlines. You can also open the
                  university portal below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openChat("Admission process")}
                className="flex w-full items-center justify-between rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4 text-left transition hover:bg-cyan-300/10"
              >
                <span>
                  <span className="block text-sm font-semibold text-cyan-100">
                    Try the live demo
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Ask your own question
                  </span>
                </span>
                <span className="text-xl text-cyan-300">↗</span>
              </button>
            </div>

            <div className="border-t border-white/10 bg-white/[0.02] px-5 py-4">
              <p className="text-center text-[10px] tracking-wide text-slate-500">
                RULE-BASED ASSISTANCE · NO API REQUIRED
              </p>
            </div>
          </div>

          <div className="absolute -right-2 top-12 hidden rounded-2xl border border-white/10 bg-[#101a2b] px-4 py-3 shadow-xl sm:block sm:-right-5">
            <p className="text-xs font-semibold text-white">
              Student-first design
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Simple. Direct. Useful.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section
        id="services"
        className="relative border-y border-white/[0.07] bg-white/[0.015] px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                STUDENT SERVICES
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                What do you need help with?
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-slate-400">
              Start with a service below, then ask the chatbot for guidance
              about your university-related question.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <button
                key={service.number}
                type="button"
                onClick={() => openChat(service.question)}
                className="group rounded-3xl border border-white/[0.09] bg-[#0c1220] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-[#101a2b]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] text-xl">
                    {service.icon}
                  </span>
                  <span className="text-xs tracking-widest text-slate-600">
                    {service.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold">{service.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {service.description}
                </p>

                <span className="mt-6 inline-block text-sm font-semibold text-cyan-300 transition group-hover:translate-x-1">
                  Ask the bot →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Chatbot call to action */}
      <section id="assistant" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-gradient-to-br from-blue-500/[0.13] via-[#0d1424] to-cyan-400/[0.06] p-7 sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 h-72 w-72 rounded-full border border-cyan-300/10"
          />
          <div
            aria-hidden="true"
            className="absolute -right-5 -top-9 h-52 w-52 rounded-full border border-cyan-300/10"
          />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
                YOUR DIGITAL HELPDESK
              </span>

              <h2 className="mt-5 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                Your question.
                <br />
                A simpler next step.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Get instant responses to questions covered by our predefined
                rules. For current fees, admission deadlines and official
                decisions, follow the university&apos;s published information.
              </p>
            </div>

            <button
              type="button"
              onClick={() => openChat()}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-cyan-300 px-7 py-4 font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-200"
            >
              Start a conversation
              <span>↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* Official links */}
      <section
        id="links"
        className="border-t border-white/[0.07] bg-white/[0.015] px-5 py-20 sm:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">
            OFFICIAL UNIVERSITY LINKS
          </p>

          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Go straight to the source.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Open the university website or student portal directly. These
            external links take you away from this helpdesk page.
          </p>

          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <a
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/[0.04] p-6 transition hover:border-cyan-300/50 hover:bg-cyan-300/[0.08] sm:p-8"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-2xl">
                🎓
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold">UOS Student Portal</h3>
                <p className="mt-2 break-all text-xs text-slate-400 sm:text-sm">
                  portal.uos.edu.pk
                </p>
                <p className="mt-3 text-xs text-cyan-300">
                  Open official portal ↗
                </p>
              </div>
            </a>

            <a
              href={UNIVERSITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 rounded-3xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-white/25 hover:bg-white/[0.05] sm:p-8"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-400/10 text-2xl">
                🏛️
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold">Official UOS Website</h3>
                <p className="mt-2 break-all text-xs text-slate-400 sm:text-sm">
                  www.uos.edu.pk
                </p>
                <p className="mt-3 text-xs text-cyan-300">
                  Visit university website ↗
                </p>
              </div>
            </a>
          </div>

          <p className="mt-5 text-xs leading-6 text-slate-500">
            Use the official portal for available student services and follow
            the university&apos;s instructions for authentication and access.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-xs text-slate-500 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold tracking-widest text-slate-300">
              UOS CONNECT
            </p>
            <p className="mt-2">
              An independent, rule-based student helpdesk project.
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <a
              href={UNIVERSITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-cyan-300"
            >
              University Website ↗
            </a>

            <a
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-cyan-300"
            >
              Student Portal ↗
            </a>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-7xl text-[10px] leading-5 text-slate-600">
          This is an independent student project and is not an official
          University of Sargodha website. Chatbot responses are based on
          predefined rules and are not live university records.
        </p>
      </footer>

      {/* Floating chatbot launcher */}
      <button
        type="button"
        onClick={() => setChatOpen((open) => !open)}
        aria-label={chatOpen ? "Close UOS chatbot" : "Open UOS chatbot"}
        aria-expanded={chatOpen}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full border border-white/15 bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-4 font-bold text-slate-950 shadow-2xl shadow-cyan-500/20 transition hover:scale-[1.03] sm:bottom-7 sm:right-7"
      >
        <span className="text-xl">{chatOpen ? "×" : "✦"}</span>
        <span className="text-sm">
          {chatOpen ? "Close chat" : "Ask UOS Bot"}
        </span>
      </button>

      {/* Integrated chatbot window */}
      {chatOpen && (
        <section
          aria-label="UOS Helpdesk chatbot"
          className="fixed bottom-24 right-3 z-50 flex h-[min(620px,calc(100dvh-8rem))] w-[calc(100vw-1.5rem)] max-w-[410px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220] shadow-2xl shadow-black/60 sm:bottom-28 sm:right-7"
        >
          <header className="flex items-center justify-between border-b border-white/10 bg-[#101a2b] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-300 font-black text-slate-950">
                U
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold">
                  UOS Helpdesk Bot
                </h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  English + Roman Urdu
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setChatOpen(false)}
              aria-label="Close chat window"
              className="rounded-xl px-3 py-2 text-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              ×
            </button>
          </header>

          <div className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={isTyping}
                  onClick={() => sendMessage(undefined, question)}
                  className="rounded-full border border-cyan-300/20 bg-cyan-300/[0.05] px-3 py-2 text-[10px] text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {messages.map((message) => {
                const isUser = message.sender === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-3 text-xs leading-6 ${
                        isUser
                          ? "rounded-br-sm bg-blue-500 text-white"
                          : "rounded-bl-sm border border-white/[0.08] bg-white/[0.05] text-slate-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.text}
                      </p>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div
                  role="status"
                  aria-label="Preparing response"
                  className="w-fit rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-cyan-300"
                >
                  Typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            onSubmit={sendMessage}
            className="border-t border-white/10 bg-[#101a2b] p-3"
          >
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#070b16] p-2 focus-within:border-cyan-300/40">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your question..."
                aria-label="Type your question"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="rounded-xl bg-cyan-300 px-4 py-3 text-xs font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>

            <a
              href={PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-center text-[10px] text-cyan-300 hover:text-cyan-200"
            >
              Need official services? Open the UOS Portal ↗
            </a>
          </form>
        </section>
      )}
    </main>
  );
}
