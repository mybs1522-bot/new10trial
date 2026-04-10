import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollFadeIn } from "@/hooks/useScrollFadeIn";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { Navbar } from "@/components/Navbar";
import { TestimonialsSection } from "@/components/testimonials-with-marquee";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  Monitor, Box, Video, Cpu, Layers, Users,
  BookOpen, CheckCircle, ArrowRight, Briefcase,
  Shield, BadgeCheck, Clock, Sparkles, Ruler, PencilRuler, Image, Clapperboard
} from "lucide-react";

import courseAutocad from "@/assets/course-autocad.jpg";
import courseSketchup from "@/assets/course-sketchup.jpg";
import courseD5 from "@/assets/course-d5render.jpg";
import courseAi from "@/assets/course-airender.jpg";
import courseWorkflow from "@/assets/course-workflow.jpg";
import courseClient from "@/assets/course-client.jpg";

import bookKitchen from "@/assets/book-kitchen.jpg";
import bookWashroom from "@/assets/book-washroom.jpg";
import bookStudy from "@/assets/book-study.jpg";
import bookBedroom from "@/assets/book-bedroom.jpg";
import bookLiving from "@/assets/book-living.jpg";
import bookElevations from "@/assets/book-elevations.jpg";

import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import hero5 from "@/assets/hero-5.jpg";
import hero6 from "@/assets/hero-6.jpg";
import hero7 from "@/assets/hero-7.jpg";
import hero8 from "@/assets/hero-8.jpg";
import logo from "@/assets/logo.png";
import { EvergreenTimer } from "@/components/EvergreenTimer";

const courses = [
  { id: "autocad", title: "AutoCAD Plan Designing", desc: "The one skill that gets you hired. You'll be drafting floor plans that clients approve on sight — most students finish this in under a week.", icon: Monitor, image: courseAutocad },
  { id: "sketchup", title: "SketchUp 3D Modeling", desc: "Turn a flat sketch into a 3D walkthrough that makes clients reach for their wallets. This is how the top 1% of designers close deals.", icon: Box, image: courseSketchup },
  { id: "d5", title: "D5 Render — Photo and Video", desc: "Photorealistic images in under 10 minutes. Your clients will think you hired a photographer. We've seen students double their rates after learning this.", icon: Video, image: courseD5 },
  { id: "ai", title: "AI Rendering Tools", desc: "Generate magazine-quality visuals in 30 seconds flat. While other designers spend 4 hours rendering, you'll be sending invoices.", icon: Cpu, image: courseAi },
  { id: "workflow", title: "Design-to-Delivery Workflow", desc: "The exact step-by-step process to take any project from first call to final handover — even if you've never managed a client before.", icon: Layers, image: courseWorkflow },
  { id: "client", title: "Client and Business Skills", desc: "Where to find clients, how to price without undercharging, and the proposal template that has a 73% close rate. This module alone pays for the membership.", icon: Users, image: courseClient },
];

const books = [
  { id: "kitchen", title: "Kitchen Design", image: bookKitchen },
  { id: "washroom", title: "Washroom Design", image: bookWashroom },
  { id: "study", title: "Study Room Design", image: bookStudy },
  { id: "bedroom", title: "Bedroom Design", image: bookBedroom },
  { id: "living", title: "Living Room Design", image: bookLiving },
  { id: "exteriors", title: "Exterior Design", image: bookElevations },
];

const stats = [
  { value: "$4.2M+", label: "Earned by students" },
  { value: "10,000+", label: "Students worldwide" },
  { value: "23", label: "Days to first dollar" },
  { value: "94%", label: "Stay after month 1" },
];

const outcomes = [
  "Bill your first client $500 to $2,000 — within 30 days",
  "Create renders that clients mistake for real photographs",
  "Draft floor plans faster than designers with 5 years experience",
  "Run a complete project solo — from first call to final invoice",
  "Earn a verified certificate accepted by firms worldwide",
  "Get matched with real freelance gigs every single week",
];

const testimonials = [
  { author: { name: "Ethan Williams", handle: "@ethan_design", avatar: "https://avatar.vercel.sh/ethan" }, text: "My wife thought I was crazy paying for another course. She's not complaining anymore — I made $8K last month from design side gigs. This is the real deal." },
  { author: { name: "Maya Johnson", handle: "@maya_creates", avatar: "https://avatar.vercel.sh/maya" }, text: "Revenue hit $10K/month by month 4. I now run my own studio with 5 active clients. I didn't think this was possible a year ago." },
  { author: { name: "Emma Collins", handle: "@emma_designs", avatar: "https://avatar.vercel.sh/emma" }, text: "$4,200 in my first 2 months. The AI rendering module changed everything — clients literally gasp when they see my presentations now." },
  { author: { name: "Sofia Martinez", handle: "@sofia_design_studio", avatar: "https://avatar.vercel.sh/sofia" }, text: "Landed a $2,500 project two weeks after starting. Used the exact proposal template from the course. Copy, paste, invoice. That simple." },
  { author: { name: "James Park", handle: "@jamespark_interiors", avatar: "https://avatar.vercel.sh/james" }, text: "I quit my 9-to-5 after month 3. Now I design full time and earn more than my old salary. Genuinely the best decision I've made." },
  { author: { name: "Liam O'Brien", handle: "@liam_builds", avatar: "https://avatar.vercel.sh/liam" }, text: "Zero design experience. 45 days later I billed my first client $1,800 for a bedroom redesign. The step-by-step approach makes it almost impossible to fail." },
  { author: { name: "Aisha Khan", handle: "@aisha_designs", avatar: "https://avatar.vercel.sh/aisha" }, text: "I was terrified of AutoCAD. Now I draft floor plans in 2 hours and have 4 repeat clients who send me referrals every month." },
  { author: { name: "Noah Chen", handle: "@noah_spaces", avatar: "https://avatar.vercel.sh/noah" }, text: "Got hired by a design firm within 30 days. They told me my SketchUp skills were better than their senior designers. I'd been learning for 3 weeks." },
  { author: { name: "Olivia Laurent", handle: "@olivia_interiors", avatar: "https://avatar.vercel.sh/olivia" }, text: "The freelance job board is a goldmine. I picked up 3 paying clients in my first week of access. Nothing else out there gives you this." },
  { author: { name: "Lucas Müller", handle: "@lucas_arch", avatar: "https://avatar.vercel.sh/lucas" }, text: "Best $20 I've ever spent. Got my first paying client before I even finished the course. The return on this is honestly absurd." },
];

const faqs = [
  { q: "I have absolutely zero experience — will I actually be able to do this?", a: "That's exactly who this was built for. 78% of our students had zero design background when they started. The program is step-by-step — we don't skip anything. You'll go from 'I don't know where to start' to sending your first invoice in about 3 weeks." },
  { q: "How quickly will I actually start making money?", a: "The average student lands their first paying project in 23 days. We don't just teach you tools — we give you a freelance job board with live gigs, plus the exact proposal templates to win them. Some students earn back their membership cost in the first week." },
  { q: "I've already tried other courses and they didn't work", a: "Most courses teach you one tool, then leave you stranded. No clients, no business skills, no path to income. We give you the complete system — 6 software skills, client-winning proposal templates, a pricing calculator, and a live job board with 100+ gigs. It's designed to get you paid, not just educated." },
  { q: "What exactly do I get for $20/month?", a: "Everything: 6 full professional courses (AutoCAD, SketchUp, D5 Render, AI tools, workflow, business skills), 6 premium design books, a verified certificate, new content added weekly, and exclusive access to our freelance job board with 100+ projects. All for less than the cost of one dinner out." },
  { q: "What if I don't like it? Am I locked in?", a: "Not even a little. Cancel anytime with one click — no questions, no awkward phone call. But honestly? 94 out of every 100 students who join end up staying because the results speak for themselves." },
];

// Smooth animation variants
const sectionVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const INLINE_TIMER_TOTAL_SECONDS = 2 * 3600 + 27 * 60 + 32;
const INLINE_TIMER_STORAGE_KEY = "landing_inline_offer_timer_start";

function getInlineTimerTimeLeft(): number {
  let start = localStorage.getItem(INLINE_TIMER_STORAGE_KEY);
  if (!start) {
    start = String(Date.now());
    localStorage.setItem(INLINE_TIMER_STORAGE_KEY, start);
  }
  const elapsed = Math.floor((Date.now() - Number(start)) / 1000);
  return INLINE_TIMER_TOTAL_SECONDS - (elapsed % INLINE_TIMER_TOTAL_SECONDS);
}

function formatInlineTimer(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function InlineOfferTimer() {
  const [timeLeft, setTimeLeft] = useState(getInlineTimerTimeLeft);

  useEffect(() => {
    const id = window.setInterval(() => setTimeLeft(getInlineTimerTimeLeft()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
      <Clock className="h-3.5 w-3.5 flex-shrink-0" />
      <span>Offer closing in</span>
      <span className="font-black tabular-nums text-emerald-800">{formatInlineTimer(timeLeft)}</span>
    </div>
  );
}

export default function LandingPage() {
  const scrollRef = useScrollFadeIn();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hideTawk = () => {
      if ((window as any).Tawk_API?.hideWidget) {
        (window as any).Tawk_API.hideWidget();
      }
    };
    hideTawk();
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_API.onLoad = hideTawk;
    return () => {
      if ((window as any).Tawk_API?.showWidget) (window as any).Tawk_API.showWidget();
      (window as any).Tawk_API.onLoad = undefined;
    };
  }, []);

  return (
    <div ref={scrollRef} className="min-h-screen bg-white overflow-x-hidden">
      <Navbar onJoinClick={() => navigate('/preview')} />

      {/* ─── HERO — PDR SECTION ─── */}
      <motion.section
        className="pt-20 sm:pt-28 pb-8 sm:pb-12 px-3 sm:px-6 bg-white text-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(152,56%,40%,0.06) 0%, transparent 60%)' }} />

        <div className="container mx-auto max-w-5xl px-0 sm:px-0 relative z-10">
          {/* Top pill badge — PAIN POINT */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex max-w-full items-center gap-2 rounded-full px-4 sm:px-5 py-2 mb-4 border whitespace-nowrap" style={{ background: 'hsl(152,56%,40%,0.06)', borderColor: 'hsl(152,56%,40%,0.2)' }}
          >
            <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'hsl(152,56%,40%)' }} />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide whitespace-nowrap" style={{ color: 'hsl(152,56%,32%)' }}>Start Making money as a designer.</span>
          </motion.div>

          {/* Greeting */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-gray-700 text-base sm:text-lg font-bold mb-3"
          >
            Hello <span className="text-accent font-extrabold">Interior Designers and Architects</span>
          </motion.p>

          {/* Pain point hook */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-gray-600 text-sm sm:text-base font-semibold max-w-2xl mx-auto mb-4 leading-snug"
          >
            Stop wasting money learning random things.
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1] mb-2"
          >
            Learn. Earn.
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1] mb-5"
            style={{ color: 'hsl(152,56%,40%)' }}
          >
            All in one place.
          </motion.h2>

          {/* Value proposition - what you get */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="max-w-3xl mx-auto mb-6"
          >
            <p className="text-gray-700 text-sm sm:text-base font-semibold mb-2">
              Courses, Software, Books and Freelance Projects
            </p>
            <p className="text-gray-600 text-xs sm:text-sm font-medium">
              for Interior Designers and Architects.
            </p>
          </motion.div>

          {/* Video embed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="max-w-4xl mx-auto mb-6 rounded-2xl overflow-hidden shadow-2xl"
            style={{ position: 'relative', paddingTop: '56.25%' }}
          >
            <iframe 
              src="https://iframe.mediadelivery.net/embed/489113/562b87e6-4ac9-40b6-b343-479ada547387?autoplay=true&loop=true&muted=true&preload=true&responsive=true" 
              loading="lazy" 
              style={{ border: 0, position: 'absolute', top: 0, height: '100%', width: '100%' }} 
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;" 
              allowFullScreen
            />
          </motion.div>

          {/* Quote Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/60 p-5 sm:p-6 text-left shadow-sm mb-6"
          >
            <p className="text-sm sm:text-base text-gray-700 italic font-serif leading-snug mb-3">
              "In our business of Architecture and Design, <span className="underline decoration-2 decoration-gray-800 font-bold not-italic">Planning, Design and Rendering</span> matter the most."
            </p>
            <div className="w-10 h-1 rounded-full bg-accent mb-3" />
            <p className="text-xs sm:text-[13px] text-gray-500 leading-snug mb-2">
              And now, the question is no longer <em className="font-semibold text-gray-700">how</em> to do it. The real question is…
            </p>
            <h3 className="text-lg sm:text-xl font-black mb-3" style={{ color: 'hsl(152,56%,40%)' }}>
              How to do it FASTER?
            </h3>

            {/* Rocket callout */}
            <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/40 p-3 sm:p-4 flex items-start gap-2.5">
              <span className="text-lg flex-shrink-0 mt-0.5">🚀</span>
              <p className="text-xs sm:text-[13px] text-gray-600 leading-snug">
                That's exactly why we built this. A complete blueprint — from software basics to client-ready renders — designed to make you{' '}
                <span className="font-bold" style={{ color: 'hsl(152,56%,40%)' }}>job or business ready in just one month.</span>
              </p>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col items-center gap-2"
          >
            <InlineOfferTimer />
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={() => navigate('/preview')}
              className="px-12 py-5 rounded-full font-bold text-sm sm:text-base uppercase tracking-wider text-white shadow-green-lg flex items-center gap-3 cta-breathe touch-manipulation"
              style={{ background: 'linear-gradient(135deg, hsl(152,56%,42%), hsl(152,56%,32%))' }}
            >
              I want To Join
              <ArrowRight className="h-5 w-5" />
            </motion.button>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">
              $20/mo · 24/7 team support · Free software included · Cancel anytime
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="mt-10 w-full overflow-hidden"
          >
            <div className="mb-5 text-center">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-gray-900">
                This Is What You'll <span className="text-accent">Create</span>
              </h3>
            </div>
            <style>{`
              @keyframes marquee-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-track {
                display: flex;
                gap: 1rem;
                animation: marquee-scroll 25s linear infinite;
                will-change: transform;
              }
            `}</style>
            <div className="w-full [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4">
              <div className="marquee-track">
                {[hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8, hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8, hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8].map((src, index) => (
                  <div
                    key={index}
                    className="relative aspect-[3/4] h-32 sm:h-40 md:h-48 flex-shrink-0"
                    style={{ transform: `rotate(${index % 3 === 0 ? -2 : index % 3 === 1 ? 1.5 : -1}deg)` }}
                  >
                    <img
                      src={src}
                      alt={`Design showcase ${(index % 8) + 1}`}
                      loading="eager"
                      className="w-full h-full object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── INVEST IN YOURSELF — ROI SECTION ─── */}
      <motion.section
        className="py-10 sm:py-16 px-5 sm:px-6 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15, margin: "-50px" }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-6 sm:mb-8" variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              How Much You Can
            </h2>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: 'hsl(152,56%,40%)' }}>
              Earn With Us
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "-50px" }}
          >
            {[
              {
                title: "Planning",
                icon: Ruler,
                beforeLabel: "BEFORE",
                beforeText: "$30 to $60 per layout",
                afterLabel: "AFTER",
                afterText: "$150 to $300 per floor plan",
              },
              {
                title: "Designing",
                icon: PencilRuler,
                beforeLabel: "BEFORE",
                beforeText: "$80 to $150 for small concepts",
                afterLabel: "AFTER",
                afterText: "$400 to $900 for full room design",
              },
              {
                title: "Image Renders",
                icon: Image,
                beforeLabel: "BEFORE",
                beforeText: "$20 to $40 per image",
                afterLabel: "AFTER",
                afterText: "$120 to $250 per render image",
              },
              {
                title: "Video Renders",
                icon: Clapperboard,
                beforeLabel: "BEFORE",
                beforeText: "$75 to $150 for basic walkthroughs",
                afterLabel: "AFTER",
                afterText: "$500 to $1,200 per walkthrough video",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all touch-manipulation"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-xs sm:text-[13px] font-bold text-gray-900 leading-tight pr-2">{card.title}</h4>
                  <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 text-accent">
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>

                {/* Before / After */}
                <div className="flex gap-3">
                  {/* Before */}
                  <div className="flex-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 line-through">BEFORE</span>
                    <p className="text-[12px] text-gray-400 font-medium mt-1 leading-snug line-through decoration-gray-300">{card.beforeText}</p>
                  </div>
                  {/* Divider */}
                  <div className="flex items-center">
                    <span className="text-gray-300 text-xs">→</span>
                  </div>
                  {/* After */}
                  <div className="flex-1">
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'hsl(152,56%,40%)' }}>AFTER</span>
                    <p className="text-[12px] font-bold text-gray-900 mt-1 leading-snug">{card.afterText}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── STRUGGLE vs BLUEPRINT ─── */}
      <motion.section
        className="py-10 sm:py-20 px-5 sm:px-8"
        style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1, margin: "-80px" }}
        variants={sectionVariants}
      >
        <div className="w-full max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div className="text-center mb-6 sm:mb-10" variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Learning Alone
            </h2>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mt-1">
              vs. <span style={{ color: 'hsl(152,56%,40%)' }}>Learning With Us</span>
            </h2>
          </motion.div>

          {/* Two-column comparison — stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8 lg:gap-10">

            {/* ═══ LEFT: The Old Struggle ═══ */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="rounded-2xl border border-red-100/60 bg-white p-5 sm:p-7 lg:p-9 touch-manipulation"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 font-black text-sm">✕</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-red-500 tracking-tight">On Your Own</h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {[
                  { emoji: "😰", text: "Hours on one design, still looks amateur" },
                  { emoji: "😵", text: "Software feels impossible to learn" },
                  { emoji: "❌", text: "Random tutorials, no clear path" },
                  { emoji: "💸", text: "Expensive tools you can't use" },
                  { emoji: "📄", text: "No portfolio, no clients" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.emoji}</span>
                    <p className="text-[13px] sm:text-sm text-gray-500 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ═══ RIGHT: Our Blueprint ═══ */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 to-white p-5 sm:p-7 lg:p-9 touch-manipulation"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4.5 w-4.5 text-accent" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-accent tracking-tight">What You Get With Us</h3>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {[
                  { emoji: "🎯", text: "Step-by-step courses: AutoCAD, SketchUp, D5, AI tools" },
                  { emoji: "⚡", text: "AI renders in seconds, not hours" },
                  { emoji: "📚", text: "Design templates for every room type" },
                  { emoji: "🔗", text: "Free software included" },
                  { emoji: "💬", text: "24/7 support from our team" },
                  { emoji: "💼", text: "Real client projects to work on" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{item.emoji}</span>
                    <p className="text-[13px] sm:text-sm text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div variants={itemVariants} className="text-center mt-10">
            <InlineOfferTimer />
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate('/preview')}
              className="px-10 py-4 rounded-full font-bold text-[12px] uppercase tracking-[0.15em] text-white shadow-green-lg flex items-center gap-2 mx-auto cta-breathe"
              style={{ background: 'linear-gradient(135deg, hsl(152,56%,42%), hsl(152,56%,32%))' }}
            >
              I want To Join
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <p className="text-[10px] text-gray-400 font-medium mt-3">$20/mo · Full access to everything · Cancel anytime</p>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── VIDEO ─── */}
      <div className="w-full">
        <video
          src="/video/intro.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full block"
          style={{ border: 'none', margin: 0, padding: 0 }}
        />
      </div>
      {/* ─── HOW TO EARN ─── */}
      <motion.section
        className="py-10 sm:py-16 px-5 sm:px-6 bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15, margin: "-50px" }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-2xl">
          <motion.div className="text-center mb-6" variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              How to <span className="text-green-gradient">Start Earning</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "-50px" }}
          >
            {[
              { step: "1", title: "Join", desc: "Sign up for $20/mo" },
              { step: "2", title: "Learn", desc: "Complete AI & software courses (included free)" },
              { step: "3", title: "Apply", desc: "Pick freelance projects posted in the community" },
              { step: "4", title: "Get Paid", desc: "Deliver work, earn $500–$5,000 per project" },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="rounded-2xl border border-border/30 bg-white p-4 sm:p-5 text-center shadow-soft hover:shadow-md transition-all touch-manipulation"
              >
                <div className="h-9 w-9 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-3 text-[12px] font-black">
                  {item.step}
                </div>
                <p className="font-display font-extrabold text-sm text-foreground mb-1">{item.title}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── WHAT'S INSIDE ─── */}
      <motion.section
        className="py-10 sm:py-14 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-xl">
          <motion.div className="text-center mb-6" variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              Everything Included
            </h2>
            <p className="text-lg sm:text-xl font-bold text-green-gradient mt-2">$20/month</p>
          </motion.div>

          <motion.div
            className="space-y-2.5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              { icon: Monitor, text: "Professional courses — new ones added every week" },
              { icon: BookOpen, text: "Design books & guides — growing library" },
              { icon: Briefcase, text: "Paid freelance projects from real clients" },
              { icon: Users, text: "10,000+ designer community" },
              { icon: Layers, text: "500+ premium 3D assets & textures" },
              { icon: BadgeCheck, text: "Verified certificate" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-center gap-3.5 rounded-xl border border-border/30 bg-white px-4 py-3 shadow-soft"
              >
                <item.icon className="h-4 w-4 text-accent flex-shrink-0" />
                <p className="text-[13.5px] font-medium text-foreground">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-7">
            <InlineOfferTimer />
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate('/preview')}
              className="px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] btn-primary text-white shadow-green-lg cta-breathe"
            >
              I want To Join
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialsSection
        title="Real members. Real results."
        description="They started exactly where you are now."
        testimonials={testimonials}
        className="bg-white py-14 sm:py-20"
      />

      {/* ─── FINAL CTA ─── */}
      <motion.section
        className="py-12 sm:py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-xl text-center">
          <h2 className="text-xl sm:text-2xl font-display font-extrabold tracking-tight text-foreground">
            Start designing. Cancel anytime. $20/mo.
          </h2>
          <InlineOfferTimer />
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => navigate('/preview')}
            className="mt-5 px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] btn-primary text-white shadow-green-lg cta-breathe"
          >
            I want To Join
          </motion.button>
        </div>
      </motion.section>

      {/* ─── ENROLLMENT POPUP ─── */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl mx-4 border-border/40 shadow-lift bg-white p-0 overflow-hidden">
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg btn-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <DialogTitle className="text-lg font-display font-bold text-foreground">You're 30 Days Away From Getting Paid</DialogTitle>
              </div>
              <p className="text-sm text-muted-foreground">Join 10,000+ students already earning from interior design</p>
            </DialogHeader>
            <EnrollmentForm />
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── TIMER ─── */}
      <EvergreenTimer onCtaClick={() => navigate('/preview')} />

      {/* ─── FOOTER ─── */}
      <motion.footer
        className="border-t border-border/30 py-10 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto max-w-6xl text-center">
          <div className="flex flex-col items-center gap-4">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <div className="text-[10px] text-muted-foreground/50 flex flex-col gap-1">
              <p>© 2025 Avada. All rights reserved.</p>
              <p className="flex items-center justify-center gap-1 uppercase tracking-widest">
                <Shield className="h-2.5 w-2.5" /> Secure & Certified Learning Platform
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
