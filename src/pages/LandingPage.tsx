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
  Shield, BadgeCheck, Clock, Sparkles
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
  { value: "94%", label: "Continue after trial" },
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
  { author: { name: "Lucas Müller", handle: "@lucas_arch", avatar: "https://avatar.vercel.sh/lucas" }, text: "Best $10 I've ever spent. Got my first paying client before I even finished the course. The return on this is honestly absurd." },
];

const faqs = [
  { q: "I have absolutely zero experience — will I actually be able to do this?", a: "That's exactly who this was built for. 78% of our students had zero design background when they started. The program is step-by-step — we don't skip anything. You'll go from 'I don't know where to start' to sending your first invoice in about 3 weeks." },
  { q: "How quickly will I actually start making money?", a: "The average student lands their first paying project in 23 days. We don't just teach you tools — we give you a freelance job board with live gigs, plus the exact proposal templates to win them. Some students earn back their membership cost in the first week." },
  { q: "I've already tried other courses and they didn't work", a: "Most courses teach you one tool, then leave you stranded. No clients, no business skills, no path to income. We give you the complete system — 6 software skills, client-winning proposal templates, a pricing calculator, and a live job board with 100+ gigs. It's designed to get you paid, not just educated." },
  { q: "What exactly do I get for $10/month?", a: "Everything: 6 full professional courses (AutoCAD, SketchUp, D5 Render, AI tools, workflow, business skills), 6 premium design books, a verified certificate, new content added weekly, and exclusive access to our freelance job board with 100+ projects. About the price of two coffees." },
  { q: "What if I don't like it? Am I locked in?", a: "Not even a little. You get 3 full days to try everything — completely free, $0 charged. If it's not for you, cancel with one click, no questions, no awkward phone call. But honestly? 94 out of every 100 students who start the trial end up staying." },
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
        className="pt-24 sm:pt-32 pb-10 sm:pb-14 px-4 bg-white text-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(152,56%,40%,0.06) 0%, transparent 60%)' }} />

        <div className="container mx-auto max-w-5xl relative z-10">
          {/* Top pill badge — PAIN POINT */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-4 border" style={{ background: 'hsl(152,56%,40%,0.06)', borderColor: 'hsl(152,56%,40%,0.2)' }}
          >
            <CheckCircle className="h-3.5 w-3.5" style={{ color: 'hsl(152,56%,40%)' }} />
            <span className="text-[11px] font-bold tracking-wide" style={{ color: 'hsl(152,56%,32%)' }}>Courses + Design Books + Freelance Board + Free Software</span>
          </motion.div>

          {/* Student count badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="h-2 w-2 rounded-full animate-pulse" style={{ background: 'hsl(152,56%,40%)' }} />
            <span className="text-[12px] font-semibold text-gray-500">50,000+ Students Supported 24/7 by Our Team</span>
          </motion.div>

          {/* Pain point hook */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="text-gray-500 text-sm sm:text-base font-medium max-w-xl mx-auto mb-4 leading-relaxed"
          >
            Stop wasting time searching 10 different places to learn design — and struggling to find projects after.
          </motion.p>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-gray-500 text-sm sm:text-base md:text-lg font-medium mb-3"
          >
            Master <span className="font-extrabold text-gray-900" style={{ borderBottom: '3px solid hsl(152,56%,40%)', paddingBottom: '2px' }}>Interior and Exterior Designing</span> — start earning from personal projects.
          </motion.p>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] mb-1"
          >
            Learn to Design
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] mb-2"
          >
            Homes, Offices & Villas
          </motion.h1>

          {/* Italic sub */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-400 text-lg sm:text-xl italic font-serif mb-8"
          >
            and show real 3D to clients.
          </motion.p>

          {/* PDR line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="text-sm sm:text-base font-bold text-gray-800 mb-1"
          >
            Learn <span style={{ color: 'hsl(152,56%,40%)' }} className="font-extrabold">PDR</span> — Planning, Designing & Rendering
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48, duration: 0.5 }}
            className="text-[13px] text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed"
          >
            We teach you everything — AutoCAD, SketchUp, D5 Render, AI tools, execution, client skills — and then connect you to real freelance projects. All in one place.
          </motion.p>

          {/* Quote Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="max-w-xl mx-auto rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/60 p-6 sm:p-8 text-left shadow-sm mb-10"
          >
            <p className="text-base sm:text-lg text-gray-700 italic font-serif leading-relaxed mb-4">
              "In our business of Architecture and Design, <span className="underline decoration-2 decoration-gray-800 font-bold not-italic">Planning, Design and Rendering</span> matter the most."
            </p>
            <div className="w-10 h-1 rounded-full bg-accent mb-4" />
            <p className="text-[13px] text-gray-500 leading-relaxed mb-2">
              And now, the question is no longer <em className="font-semibold text-gray-700">how</em> to do it. The real question is…
            </p>
            <h3 className="text-xl sm:text-2xl font-black" style={{ color: 'hsl(152,56%,40%)' }}>
              How to do it FASTER?
            </h3>

            {/* Rocket callout */}
            <div className="mt-5 rounded-xl bg-emerald-50/80 border border-emerald-200/40 p-4 flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">🚀</span>
              <p className="text-[13px] text-gray-600 leading-relaxed">
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
            className="flex flex-col items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate('/preview')}
              className="px-10 py-4 rounded-full font-bold text-[12px] uppercase tracking-[0.15em] text-white shadow-green-lg flex items-center gap-2 cta-breathe"
              style={{ background: 'linear-gradient(135deg, hsl(152,56%,42%), hsl(152,56%,32%))' }}
            >
              Start Designing Free
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">
              No card needed · 24/7 team support · Free software included · Cancel anytime
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── INVEST IN YOURSELF — ROI SECTION ─── */}
      <motion.section
        className="py-14 sm:py-20 px-4 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-10" variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              Start Today.
            </h2>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight" style={{ color: 'hsl(152,56%,40%)' }}>
              See what changes in your career.
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              {
                title: "Single Render Charge",
                emoji: "🖼️",
                beforeLabel: "BEFORE",
                beforeText: "Struggling to ask ₹1000",
                afterLabel: "AFTER",
                afterText: "Confidently quoting ₹5,000+",
              },
              {
                title: "Interior Design Project",
                emoji: "🏠",
                beforeLabel: "BEFORE",
                beforeText: "Rejected for poor 3D quality",
                afterLabel: "AFTER",
                afterText: "Winning ₹80,000+ contracts",
              },
              {
                title: "Time to Finish a Room",
                emoji: "⏰",
                beforeLabel: "BEFORE",
                beforeText: "3 Frustrating, Sleepless Nights",
                afterLabel: "AFTER",
                afterText: "2 Easy Hours with our AI Workflow",
              },
              {
                title: "Your Career Confidence",
                emoji: "🌟",
                beforeLabel: "BEFORE",
                beforeText: "Constantly Anxious & Overwhelmed",
                afterLabel: "AFTER",
                afterText: "Relaxed, In-Demand Professional",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-5">
                  <h4 className="text-[13px] font-bold text-gray-900 leading-tight pr-2">{card.title}</h4>
                  <span className="text-2xl flex-shrink-0">{card.emoji}</span>
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
        className="py-16 sm:py-24 px-4 sm:px-8"
        style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={sectionVariants}
      >
        <div className="w-full max-w-7xl mx-auto">
          {/* Heading */}
          <motion.div className="text-center mb-10 sm:mb-14" variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
              The Lonely, Frustrating Path
            </h2>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mt-1">
              vs. <span style={{ color: 'hsl(152,56%,40%)' }}>Our Hand-Holding Blueprint</span>
            </h2>
            <p className="text-sm text-gray-400 mt-3 max-w-md mx-auto">See why 10,000+ beginners chose us over figuring it out alone</p>
          </motion.div>

          {/* Two-column comparison — stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">

            {/* ═══ LEFT: The Old Struggle ═══ */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-red-100/60 bg-white p-6 sm:p-8 lg:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 font-black text-sm">✕</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-red-500 tracking-tight">The Old Struggle</h3>
              </div>

              <div className="space-y-5">
                {[
                  { emoji: "😰", text: "Spending hours on one 3D view — and clients still ask for revisions" },
                  { emoji: "😵", text: "Software feels overwhelming — you don't know where to even start" },
                  { emoji: "🤖", text: "AI is creating designs in seconds — and you're worried your skills are already outdated" },
                  { emoji: "❌", text: "Random YouTube tutorials that leave you more confused than before" },
                  { emoji: "💸", text: "Paying for expensive software you barely know how to use" },
                  { emoji: "📄", text: "No portfolio. No confidence. No idea how to land your first client" },
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
              className="rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/40 to-white p-6 sm:p-8 lg:p-10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4.5 w-4.5 text-accent" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-accent tracking-tight">What You Get With Us</h3>
              </div>

              <div className="space-y-5">
                {[
                  { emoji: "🎯", text: "Structured courses covering AutoCAD, SketchUp, D5 Render, AI Rendering, Execution & Client Management" },
                  { emoji: "⚡", text: "AI renders your designs in seconds — 10x faster output, zero stress" },
                  { emoji: "📚", text: "Execution books for Kitchen, Bedroom, Living Room, Washroom, Study & Exterior — ready to use" },
                  { emoji: "🔗", text: "All software links included free — stop paying for expensive licenses" },
                  { emoji: "💬", text: "24/7 team support — installation, doubts, project reviews, we're always here" },
                  { emoji: "💼", text: "Built-in freelance board → apply for real client projects while learning" },
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
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate('/preview')}
              className="px-10 py-4 rounded-full font-bold text-[12px] uppercase tracking-[0.15em] text-white shadow-green-lg flex items-center gap-2 mx-auto cta-breathe"
              style={{ background: 'linear-gradient(135deg, hsl(152,56%,42%), hsl(152,56%,32%))' }}
            >
              Start Designing Free
              <ArrowRight className="h-4 w-4" />
            </motion.button>
            <p className="text-[10px] text-gray-400 font-medium mt-3">No card needed · Full access to everything · Cancel anytime · $10/mo after</p>
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
        className="py-12 sm:py-16 px-4 bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-2xl">
          <motion.div className="text-center mb-8" variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              How do you <span className="text-green-gradient">start earning?</span>
            </h2>
            <p className="mt-2 text-[13px] text-muted-foreground">Four steps. That's it.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              { step: "1", title: "Join", desc: "Sign up for $10/mo" },
              { step: "2", title: "Learn", desc: "Complete AI & software courses (included free)" },
              { step: "3", title: "Apply", desc: "Pick freelance projects posted in the community" },
              { step: "4", title: "Get Paid", desc: "Deliver work, earn $500–$5,000 per project" },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                className="rounded-2xl border border-border/30 bg-white p-4 text-center shadow-soft"
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
        className="py-12 sm:py-16 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-xl">
          <motion.div className="text-center mb-8" variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              Everything you need.{" "}
              <span className="text-green-gradient">$10/mo.</span>
            </h2>
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
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate('/preview')}
              className="px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] btn-primary text-white shadow-green-lg cta-breathe"
            >
              Start Designing Free
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
            Start designing. Cancel anytime. $10/mo.
          </h2>
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => navigate('/preview')}
            className="mt-5 px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] btn-primary text-white shadow-green-lg cta-breathe"
          >
            Start Designing Free
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
