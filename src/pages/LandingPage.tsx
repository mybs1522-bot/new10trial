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
  { id: "autocad", title: "AutoCAD Plan Designing", desc: "The skill every design firm pays for. You'll learn to draft professional floor plans clients actually approve — in days, not months.", icon: Monitor, image: courseAutocad },
  { id: "sketchup", title: "SketchUp 3D Modeling", desc: "Turn flat drawings into 3D walkthroughs that make clients say 'yes' on the spot. This is the tool top studios use daily.", icon: Box, image: courseSketchup },
  { id: "d5", title: "D5 Render — Photo and Video", desc: "Create photorealistic renders in minutes. Your clients won't believe these are computer-generated. Seriously.", icon: Video, image: courseD5 },
  { id: "ai", title: "AI Rendering Tools", desc: "While others spend hours rendering, you'll generate stunning visuals in seconds using AI. It feels a bit like cheating.", icon: Cpu, image: courseAi },
  { id: "workflow", title: "Design-to-Delivery Workflow", desc: "The complete system that lets you handle a full project from concept to handover — even if you're working solo.", icon: Layers, image: courseWorkflow },
  { id: "client", title: "Client and Business Skills", desc: "How to find clients, price your work, write proposals that win, and build a design business that actually pays the bills.", icon: Users, image: courseClient },
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
  { value: "10,000+", label: "Students enrolled" },
  { value: "$3K+", label: "Avg. monthly income" },
  { value: "30", label: "Days to first client" },
  { value: "94%", label: "Stay after their trial" },
];

const outcomes = [
  "Land your first paying client within weeks",
  "Create renders so realistic, clients sign on the spot",
  "Draft professional floor plans with confidence",
  "Deliver complete projects solo — concept to handover",
  "Earn a verified certificate that opens real doors",
  "Access a private freelance board with fresh gigs every week",
];

const testimonials = [
  { author: { name: "Emma Collins", handle: "@emma_designs", avatar: "https://avatar.vercel.sh/emma" }, text: "Made $4,200 in my first 2 months. The AI rendering module alone is worth the entire price — I close so many more clients now." },
  { author: { name: "James Park", handle: "@jamespark_interiors", avatar: "https://avatar.vercel.sh/james" }, text: "I quit my 9-to-5 after month 3. Now I do freelance interior design full time. This program genuinely changed the direction of my life." },
  { author: { name: "Sofia Martinez", handle: "@sofia_design_studio", avatar: "https://avatar.vercel.sh/sofia" }, text: "Landed a $2,500 project two weeks after starting. The proposal templates are copy-paste gold. Paid for itself many times over." },
  { author: { name: "Liam O'Brien", handle: "@liam_builds", avatar: "https://avatar.vercel.sh/liam" }, text: "I had zero design experience. 45 days later I billed my first client $1,800. The step-by-step approach makes it really hard to fail." },
  { author: { name: "Aisha Khan", handle: "@aisha_designs", avatar: "https://avatar.vercel.sh/aisha" }, text: "I was scared of AutoCAD. Now I draft floor plans in 2 hours and have 4 repeat clients. Honestly can't believe how far I've come." },
  { author: { name: "Noah Chen", handle: "@noah_spaces", avatar: "https://avatar.vercel.sh/noah" }, text: "Got hired by a design firm within 30 days of completing. They said my SketchUp and D5 skills were better than their senior designers." },
  { author: { name: "Olivia Laurent", handle: "@olivia_interiors", avatar: "https://avatar.vercel.sh/olivia" }, text: "The freelance job board alone is incredible — real gigs posted every week. I picked up 3 clients in my first week of access." },
  { author: { name: "Ethan Williams", handle: "@ethan_design", avatar: "https://avatar.vercel.sh/ethan" }, text: "My wife thought I was crazy paying for another course. She's not complaining anymore — I made $8K last month from design side gigs." },
  { author: { name: "Maya Johnson", handle: "@maya_creates", avatar: "https://avatar.vercel.sh/maya" }, text: "Running my own design studio with 5 active clients now. Revenue hit $10K/month in month 4. This program gave me everything I needed." },
  { author: { name: "Lucas Müller", handle: "@lucas_arch", avatar: "https://avatar.vercel.sh/lucas" }, text: "Best $10 I've ever spent. Got my first paying client before I even finished the course. The return on this is honestly absurd." },
];

const faqs = [
  { q: "I have zero experience — is this really for me?", a: "Yes, and honestly that's who we built this for. Most of our top earners started with no design background at all. The program takes you from knowing nothing to billing your first client, step by step. No guesswork." },
  { q: "How quickly can I actually start earning?", a: "Most students land their first paid project within 2 to 4 weeks. We have a private freelance board with real gigs posted every week, and we give you the proposal templates to actually win them." },
  { q: "How is this different from other online courses?", a: "Most courses teach you one tool and leave you to figure out the rest. We give you the complete system — software skills, client templates, proposal scripts, pricing calculators, and a live job board. Everything you need to run a real business." },
  { q: "What do I get for $10 a month?", a: "All 6 professional courses, 6 premium design books, verified certificates, new weekly content, and exclusive access to our freelance project board. You can cancel anytime and keep everything you've learned." },
  { q: "What if it's not right for me?", a: "You get a 3-day free trial — no charge. Try everything, see the quality. If it's not for you, cancel with one click. Over 94% of students who start end up staying, but there's zero pressure either way." },
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
        tagline="867 people started this week"
        title={
          <>
            Learn interior design.{" "}
            <span className="text-green-gradient">Start earning within weeks.</span>
          </>
        }
        description="The complete system that takes you from zero experience to landing real paying clients. AutoCAD, SketchUp, AI rendering, freelance skills — all in one place. Try it free for 3 days."
        ctaText="Start your free trial"
        ctaSecondaryText="See what's included"
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
            <p className="section-label mb-3">Sound familiar?</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              You've probably been{" "}
              <span className="text-green-gradient">going in circles</span>
            </h2>
            <p className="mt-4 text-[15px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Random YouTube tutorials. Expensive courses that teach one tool. No clients. No income. No real plan. If that sounds like where you are right now, you're not alone — and there's a better way.
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
                <span className="h-2 w-2 rounded-full bg-red-400" /> Without a system
              </h3>
              <ul className="space-y-3 text-[13.5px] text-muted-foreground">
                {["Spending hours on YouTube with no clear direction", "Buying $500+ courses that only teach one tool", "Still can't create renders that impress real clients", "No idea how to find work, price it, or close deals", "Months in and still haven't earned anything from design"].map((item) => (
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
                <span className="h-2 w-2 rounded-full bg-accent" /> With this program
              </h3>
              <ul className="space-y-3 text-[13.5px] text-muted-foreground">
                {["One clear path from beginner to earning — in about 30 days", "AI renders in seconds that clients think are photographs", "A private job board with real freelance gigs every week", "Ready-to-use proposal templates that actually win work", "A verified certificate that helps you get hired"].map((item) => (
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
            <p className="section-label mb-3">What you'll learn</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
              Six skills that actually pay
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-lg mx-auto">Every skill here is a real revenue stream. Most designers only know one or two of these. You'll learn all six.</p>
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
            <p className="section-label mb-3">What happens in your first 30 days</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
              Here's what you'll walk away with
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
          Try it free for 3 days
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
            <p className="section-label mb-3">Included with your membership</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
              6 premium design books, on the house
            </h2>
            <p className="mt-3 text-[15px] text-muted-foreground max-w-lg mx-auto">Room-by-room execution guides written by working architects. Normally sold separately — yours free with your membership.</p>
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
        title="Real students, real results"
        description="These aren't made-up stories. These are real people who started exactly where you are — and built real income from interior design."
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
            <p className="section-label mb-3">Got questions?</p>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground">
              Let's clear up a few things
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
          <p className="section-label mb-3">Ready to get started?</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
            Your first paying client could be a few weeks away
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground max-w-lg mx-auto">
            6 professional courses, 6 design books, a freelance job board, and a certificate. All for $0 today. If it's not for you, cancel anytime — no questions asked.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 mt-5 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> $0 due today</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-accent" /> Cancel anytime</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-accent" /> 94% stay after their trial</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => navigate('/preview')}
            className="mt-8 px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] btn-primary text-white shadow-green-lg cta-breathe"
          >
            Start your free trial
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
