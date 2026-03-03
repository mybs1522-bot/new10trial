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
        tagline="Learn design skills + get real freelance projects"
        title={
          <>
            The only platform where you{" "}
            <span className="text-green-gradient">learn and earn at the same time</span>
          </>
        }
        description="Master 6 design tools, then apply for real freelance projects — all inside one community. No job hunting. No cold outreach. We bring the clients to you. Try it free, $0 today."
        ctaText="Get instant access — $0 today"
        ctaSecondaryText="See the full curriculum"
        onCtaClick={() => navigate('/preview')}
        onCtaSecondaryClick={() => document.getElementById("curriculum")?.scrollIntoView({ behavior: "smooth" })}
        images={[hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8]}
      />

      {/* ─── COMPACT STATS ─── */}
      <motion.section
        className="py-10 sm:py-12 border-y border-border/40"
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

      {/* ─── WHAT'S INSIDE ─── */}
      <motion.section
        className="py-14 sm:py-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-2xl">
          <motion.div className="text-center mb-10" variants={sectionVariants}>
            <p className="section-label mb-3">Everything for $10/mo</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              What you get inside
            </h2>
          </motion.div>

          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              { icon: Monitor, text: "6 professional courses — AutoCAD, SketchUp, D5 Render, AI Render & more" },
              { icon: BookOpen, text: "6 room-by-room design books (kitchen, bedroom, living & more)" },
              { icon: Briefcase, text: "Paid freelance projects — real clients, real money, every week" },
              { icon: Users, text: "Private community of 10,000+ designers learning & earning together" },
              { icon: Layers, text: "500+ premium 3D assets, textures & models" },
              { icon: BadgeCheck, text: "Verified certificate accepted by design firms worldwide" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="flex items-center gap-4 rounded-2xl border border-border/30 bg-white p-4 shadow-soft card-hover"
              >
                <div className="h-10 w-10 rounded-xl bg-accent/8 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4.5 w-4.5 text-accent" />
                </div>
                <p className="text-[14px] font-medium text-foreground">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-8">
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => navigate('/preview')}
              className="px-10 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] btn-primary text-white shadow-green-lg cta-breathe"
            >
              See full curriculum — free preview
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── THE BEST PART ─── */}
      <motion.section
        className="py-14 sm:py-20 px-4 bg-accent/[0.03]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-2xl text-center">
          <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
            <Briefcase className="h-6 w-6 text-accent" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-foreground leading-tight mb-4">
            You don't just learn here.{" "}
            <span className="text-green-gradient">You get hired here.</span>
          </h2>
          <p className="text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed mb-6">
            Our freelance board brings real client projects directly to you — no cold outreach, no job hunting. Learn a skill, apply it to a paid gig, start earning. All in one place.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-white rounded-full border border-border/30 px-3 py-1.5 shadow-soft">
              <CheckCircle className="h-3.5 w-3.5 text-accent" /> New projects every week
            </span>
            <span className="flex items-center gap-1.5 bg-white rounded-full border border-border/30 px-3 py-1.5 shadow-soft">
              <CheckCircle className="h-3.5 w-3.5 text-accent" /> Portfolio verification
            </span>
            <span className="flex items-center gap-1.5 bg-white rounded-full border border-border/30 px-3 py-1.5 shadow-soft">
              <CheckCircle className="h-3.5 w-3.5 text-accent" /> $500-$5,000 per project
            </span>
          </div>
        </div>
      </motion.section>

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialsSection
        title="People who said 'I can't do this' — then did it"
        description="Every person below started with zero experience. Read what happened next."
        testimonials={testimonials}
        className="bg-white py-14 sm:py-20"
      />

      {/* ─── FINAL CTA ─── */}
      <motion.section
        className="py-14 sm:py-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-extrabold tracking-tight text-foreground">
            Start free. Cancel anytime.
          </h2>
          <p className="mt-4 text-[15px] text-muted-foreground max-w-md mx-auto">
            3-day free trial, then $10/mo. 6 courses, 6 books, paid projects, and a certificate. Less than two coffees a month.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 mt-5 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-accent" /> $0 charged today</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-accent" /> Cancel in one click</span>
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
