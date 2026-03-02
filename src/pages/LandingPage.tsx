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
  BookOpen, CheckCircle, ArrowRight,
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
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

      {/* ─── HERO ─── */}
      <AnimatedMarqueeHero
        tagline="$4.2M+ earned by our students so far"
        title={
          <>
            The $10/month program that turned{" "}
            <span className="text-green-gradient">10,000 beginners into paid designers</span>
          </>
        }
        description="6 professional courses. 6 design books. 100+ freelance gigs. A verified certificate. Everything you need to go from 'I have no experience' to billing your first client — in about 3 weeks. Try it free, $0 today."
        ctaText="Get instant access — $0 today"
        ctaSecondaryText="See the full curriculum"
        onCtaClick={() => navigate('/preview')}
        onCtaSecondaryClick={() => document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })}
        images={[hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8]}
      />

      {/* ─── SOCIAL PROOF BAR ─── */}
      <motion.section
        className="py-12 sm:py-14 border-y border-border/40"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <motion.div key={s.label} className="text-center" variants={itemVariants}>
                <p className="text-2xl sm:text-3xl font-display font-extrabold text-foreground">{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-1.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── PROBLEM → SOLUTION ─── */}
      <motion.section
        className="py-16 sm:py-24 px-4"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div className="text-center mb-12" variants={sectionVariants}>
            <p className="section-label mb-3">Be honest with yourself</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              You've already wasted months.{" "}
              <span className="text-green-gradient">This is the way out.</span>
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              You've watched the tutorials. Maybe bought a course or two. You still can't land a client. You still can't create work worth paying for. And every week that passes, that dream slips a little further away. It doesn't have to be like this.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Without */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-red-100 bg-red-50/30 p-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-500/80 mb-5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-400" /> Where you are now
              </h3>
              <ul className="space-y-3 text-[13.5px] text-muted-foreground">
                {["Watching random YouTube tutorials that lead nowhere", "Spent $500+ on courses that taught one tool and left you stuck", "Your renders look amateur and you know it", "No idea how to find clients, price your work, or close deals", "Months in — still zero income from design"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="text-red-400/70 mt-0.5 font-medium">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            {/* With */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-accent/15 bg-accent/[0.03] p-6">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent mb-5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" /> Where you'll be in 30 days
              </h3>
              <ul className="space-y-3 text-[13.5px] text-muted-foreground">
                {["One clear roadmap — from zero to your first paying client", "AI renders in under 30 seconds that clients think are photographs", "A private job board with 100+ freelance gigs waiting for you", "Copy-paste proposal templates with a 73% close rate", "A verified certificate that gets you hired at design firms"].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── COURSES ─── */}
      <motion.section
        className="py-16 sm:py-24 px-4 bg-secondary/30"
        id="curriculum"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-12" variants={sectionVariants}>
            <p className="section-label mb-3">The curriculum</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
              6 skills. 6 income streams. One membership.
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-lg mx-auto">Each of these is a standalone skill that clients pay $500 to $5,000 for. Most designers know one. You'll master all six.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {courses.map((c) => (
              <motion.div
                key={c.id}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-border/30 bg-white shadow-soft card-hover"
              >
                <div className="aspect-square overflow-hidden">
                  <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" />
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="h-8 w-8 rounded-lg bg-accent/8 flex items-center justify-center group-hover:bg-accent group-hover:shadow-green transition-all duration-300">
                      <c.icon className="h-3.5 w-3.5 text-accent group-hover:text-white transition-colors duration-300" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-accent bg-accent/6 px-2 py-0.5 rounded-full hidden sm:inline">
                      Included
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-1 leading-snug">{c.title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── OUTCOMES ─── */}
      <motion.section
        className="py-16 sm:py-24 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-3xl">
          <motion.div className="text-center mb-10" variants={sectionVariants}>
            <p className="section-label mb-3">Your first 30 days</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
              This is what $10 and 30 days gets you
            </h2>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {outcomes.map((item, i) => (
              <motion.div key={i} variants={itemVariants} className="flex items-center gap-3.5 rounded-2xl border border-border/30 bg-white p-4 shadow-soft card-hover">
                <div className="h-9 w-9 rounded-full btn-primary flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <p className="text-[13.5px] font-medium text-foreground">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── MID CTA ─── */}
      <motion.section
        className="py-10 sm:py-14 px-4 text-center"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => navigate('/preview')}
          className="px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] btn-primary text-white shadow-green-lg cta-breathe"
        >
          Get instant access — $0 today
        </motion.button>
      </motion.section>

      {/* ─── BOOKS ─── */}
      <motion.section
        className="py-16 sm:py-24 px-4 bg-secondary/30"
        id="books"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div className="text-center mb-10" variants={sectionVariants}>
            <p className="section-label mb-3">$500+ worth of books — included free</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
              6 room-by-room design bibles
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-lg mx-auto">Written by working architects. Used by 10,000+ students. These books alone sell for $500+ elsewhere — they're yours the moment you sign up.</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {books.map((b) => (
              <motion.div
                key={b.id}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl card-hover aspect-[3/4] cursor-pointer shadow-soft"
              >
                <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-600" />
                <div className="absolute inset-0 bg-foreground/35 group-hover:bg-foreground/25 transition-colors duration-300 flex flex-col items-center justify-center p-3 text-center">
                  <div className="h-10 w-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center mb-2 border border-white/20">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-white leading-tight drop-shadow-md">{b.title}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialsSection
        title="People who said 'I can't do this' — then did it"
        description="Every person below started with zero experience, zero clients, and zero income from design. Read what happened next."
        testimonials={testimonials}
        className="bg-white py-16 sm:py-24"
      />

      {/* ─── FAQ ─── */}
      <motion.section
        className="py-16 sm:py-24 px-4 bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-2xl">
          <motion.div className="text-center mb-10" variants={sectionVariants}>
            <p className="section-label mb-3">Still on the fence?</p>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground">
              Every question we get, answered honestly
            </h2>
          </motion.div>

          <motion.div
            className="space-y-2.5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {faqs.map((faq, i) => (
              <motion.details key={i} variants={itemVariants} className="group rounded-2xl border border-border/30 bg-white p-5 cursor-pointer shadow-soft card-hover">
                <summary className="flex items-center justify-between text-[14px] font-semibold text-foreground list-none">
                  {faq.q}
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform duration-300 flex-shrink-0 ml-3" />
                </summary>
                <p className="mt-3 text-[13px] text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ─── FINAL CTA ─── */}
      <motion.section
        className="py-16 sm:py-24 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-2xl text-center">
          <p className="section-label mb-3">You've read this far for a reason</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
            23 days from now, you could have your first paying client
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground max-w-lg mx-auto">
            6 courses, 6 books, 100+ freelance gigs, and a certificate — for less than two coffees a month. Start free today. If you don't love it, cancel in one click. But you won't.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 mt-5 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> $0 charged today</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-accent" /> Cancel in one click</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-accent" /> 94% never cancel</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => navigate('/preview')}
            className="mt-8 px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] btn-primary text-white shadow-green-lg cta-breathe"
          >
            Get instant access — $0 today
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
