import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Briefcase, Layers, ArrowRight, X, ChevronUp, Clock } from "lucide-react";
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
import logo from "@/assets/logo.png";
import { PreviewSignupForm } from "@/components/PreviewSignupForm";

const COURSES = [
    { id: "autocad", title: "AutoCAD Plan Designing", desc: "2D floor plans, sections & working drawings", lessons: 12, image: courseAutocad },
    { id: "sketchup", title: "SketchUp 3D Designing", desc: "3D models and walkthroughs for clients", lessons: 10, image: courseSketchup },
    { id: "d5", title: "D5 Render - Photo & Video", desc: "Photorealistic renders and cinematic walkthroughs", lessons: 8, image: courseD5 },
    { id: "ai", title: "AI Rendering - Photo & Video", desc: "AI tools for instant high-quality renders", lessons: 8, image: courseAi },
    { id: "workflow", title: "Design-to-Execution Workflow", desc: "Bridge design and real-world construction", lessons: 14, image: courseWorkflow },
    { id: "client", title: "Client & Site Management", desc: "Handle clients, BOQs, and projects", lessons: 10, image: courseClient },
];

const BOOKS = [
    { id: "kitchen", title: "How to Design Kitchen", image: bookKitchen },
    { id: "washroom", title: "How to Design Washroom", image: bookWashroom },
    { id: "study", title: "How to Design Study", image: bookStudy },
    { id: "bedroom", title: "How to Design Bedroom", image: bookBedroom },
    { id: "living", title: "How to Design Living Room", image: bookLiving },
    { id: "exteriors", title: "How to Design Exteriors", image: bookElevations },
];

const SAMPLE_JOBS = [
    { title: "Complete Interior Design for 2-Bed Apartment", budget: "$800 - $1.5K", location: "Brooklyn, New York", daysAgo: 1 },
    { title: "3-Bed Flat - Scandinavian Style Interiors", budget: "$1.2K - $2.5K", location: "Shoreditch, London", daysAgo: 0 },
    { title: "Luxury Penthouse Interior Design", budget: "$2K - $4K", location: "Marina Bay, Singapore", daysAgo: 2 },
    { title: "Restaurant Interior Design - 1800 sq ft", budget: "$1.5K - $3K", location: "Le Marais, Paris", daysAgo: 1 },
    { title: "Corporate Office Interior - 2000 sq ft", budget: "$1K - $2.5K", location: "CBD, Sydney", daysAgo: 0 },
    { title: "Master Bedroom Design with Bathroom", budget: "$500 - $1.2K", location: "Jumeirah, Dubai", daysAgo: 3 },
];

const ASSETS_3D = [
    { title: "Living Room Furniture Pack", items: "45+ models" },
    { title: "Kitchen Modular Set", items: "30+ models" },
    { title: "Bathroom Fixtures Collection", items: "25+ models" },
    { title: "Office Furniture Bundle", items: "35+ models" },
    { title: "Exterior Landscape Pack", items: "50+ models" },
    { title: "Lighting & Decor Set", items: "60+ models" },
];

const UPCOMING_COURSES = [
    "Lumion Rendering Masterclass",
    "Revit for Interior Designers",
    "V-Ray Lighting & Materials",
    "Enscape Real-Time Walkthrough",
    "3ds Max Interior Visualization",
    "Color Theory for Interiors",
    "Space Planning Fundamentals",
    "Blender for Architectural Viz",
];

const UPCOMING_BOOKS = [
    "How to Design a Pooja Room",
    "How to Design a Home Office",
    "How to Design a Kids Room",
    "How to Design a Balcony & Terrace",
    "How to Design a Dining Area",
    "How to Design a Walk-in Closet",
];

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    visible: (i: number) => ({
        opacity: 1, y: 0, scale: 1,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
};

const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export default function PreviewPage() {
    const [showForm, setShowForm] = useState(false);
    const topRef = useRef<HTMLDivElement>(null);

    // Evergreen countdown timer (resets from localStorage)
    const getInitialSeconds = () => {
        try {
            const stored = localStorage.getItem("preview_timer");
            if (stored) {
                const remaining = Math.floor((JSON.parse(stored) - Date.now()) / 1000);
                if (remaining > 0) return remaining;
            }
        } catch { }
        const secs = 3 * 3600 + 23 * 60 + 32;
        localStorage.setItem("preview_timer", JSON.stringify(Date.now() + secs * 1000));
        return secs;
    };
    const [timeLeft, setTimeLeft] = useState(getInitialSeconds);
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    const secs = 3 * 3600 + 23 * 60 + 32;
                    localStorage.setItem("preview_timer", JSON.stringify(Date.now() + secs * 1000));
                    return secs;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const tH = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
    const tM = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
    const tS = String(timeLeft % 60).padStart(2, "0");

    const SECTIONS = [
        {
            id: "courses",
            title: "6 Professional Courses",
            subtitle: "Master every tool clients pay for",
            icon: GraduationCap,
            color: "from-emerald-500/10 to-teal-500/10",
            iconColor: "text-emerald-500",
            borderColor: "border-emerald-500/20",
        },
        {
            id: "books",
            title: "6 Design Books",
            subtitle: "Room-by-room execution guides",
            icon: BookOpen,
            color: "from-amber-500/10 to-orange-500/10",
            iconColor: "text-amber-500",
            borderColor: "border-amber-500/20",
        },
        {
            id: "freelance",
            title: "Freelance Job Board",
            subtitle: "Real client projects, real money",
            icon: Briefcase,
            color: "from-blue-500/10 to-indigo-500/10",
            iconColor: "text-blue-500",
            borderColor: "border-blue-500/20",
        },
        {
            id: "assets",
            title: "3D Asset Library",
            subtitle: "Ready-to-use models & textures",
            icon: Layers,
            color: "from-purple-500/10 to-pink-500/10",
            iconColor: "text-purple-500",
            borderColor: "border-purple-500/20",
        },
    ];

    return (
        <div ref={topRef} className="min-h-screen bg-background relative">
            {/* Minimal header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Avada" className="h-7 w-7" />
                        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground">Avada Academy</span>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-gold px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] text-white shadow-gold hover:scale-105 transition-transform"
                    >
                        Start Free Trial
                    </button>
                </div>
            </header>

            {/* Hero intro */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-6 sm:pt-14 sm:pb-8 text-center"
            >
                <p className="text-accent text-[10px] font-black tracking-[0.25em] uppercase mb-3">What You Get With Your Trial</p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3 leading-tight">
                    Everything You Need to Start<br className="hidden sm:block" /> Earning as a Designer
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-xl mx-auto">
                    Browse the full collection below. Start your 3-day free trial to unlock everything instantly.
                </p>
            </motion.section>

            {/* 4 Section Cards - 2×2 grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {SECTIONS.map((section, i) => (
                        <motion.a
                            key={section.id}
                            href={`#${section.id}`}
                            custom={i}
                            initial="hidden"
                            animate="visible"
                            variants={cardVariants}
                            className={`bg-gradient-to-br ${section.color} rounded-2xl p-4 sm:p-5 border ${section.borderColor} hover:scale-[1.03] transition-transform cursor-pointer group`}
                        >
                            <section.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${section.iconColor} mb-3 group-hover:scale-110 transition-transform`} />
                            <h3 className="text-[11px] sm:text-xs font-black text-foreground uppercase tracking-tight mb-1">{section.title}</h3>
                            <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground leading-relaxed">{section.subtitle}</p>
                        </motion.a>
                    ))}
                </div>
            </div>

            {/* ═══ COURSES SECTION ═══ */}
            <motion.section
                id="courses"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={sectionVariants}
                className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16"
            >
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 mb-6 text-center sm:text-left">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">Courses</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">6 Professional Courses Included</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {COURSES.map((course, i) => (
                        <motion.div
                            key={course.id}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }}
                            variants={cardVariants}
                            className="rounded-2xl overflow-hidden bg-card border border-white/5 group hover:border-emerald-500/20 transition-all"
                        >
                            <div className="aspect-[4/3] overflow-hidden relative">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <span className="absolute bottom-2 left-2 text-[8px] sm:text-[9px] font-black text-white/80 uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                                    {course.lessons} lessons
                                </span>
                            </div>
                            <div className="p-3 sm:p-4 text-center sm:text-left">
                                <h3 className="text-[11px] sm:text-xs font-black text-foreground uppercase tracking-tight mb-1 line-clamp-1">{course.title}</h3>
                                <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground leading-relaxed line-clamp-2">{course.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Coming this week */}
                <div className="mt-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                        <Clock className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">New courses coming this week</span>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {UPCOMING_COURSES.map((name) => (
                            <span key={name} className="text-[9px] sm:text-[10px] font-bold text-muted-foreground bg-foreground/[0.03] border border-white/5 px-2.5 py-1.5 rounded-lg">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* ═══ BOOKS SECTION ═══ */}
            <motion.section
                id="books"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={sectionVariants}
                className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16"
            >
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 mb-6 text-center sm:text-left">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">Design Books</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">6 Premium Execution Guides</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {BOOKS.map((book, i) => (
                        <motion.div
                            key={book.id}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }}
                            variants={cardVariants}
                            className="rounded-2xl overflow-hidden bg-card border border-white/5 group hover:border-amber-500/20 transition-all"
                        >
                            <div className="aspect-[4/3] overflow-hidden">
                                <img src={book.image} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                            </div>
                            <div className="p-3 sm:p-4 text-center sm:text-left">
                                <h3 className="text-[11px] sm:text-xs font-black text-foreground uppercase tracking-tight mb-1 line-clamp-1">{book.title}</h3>
                                <p className="text-[9px] sm:text-[10px] font-medium text-muted-foreground">Execution Guide - PDF</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Coming this week */}
                <div className="mt-5 rounded-2xl border border-amber-500/10 bg-amber-500/[0.03] p-4 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                        <Clock className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">New books coming this week</span>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {UPCOMING_BOOKS.map((name) => (
                            <span key={name} className="text-[9px] sm:text-[10px] font-bold text-muted-foreground bg-foreground/[0.03] border border-white/5 px-2.5 py-1.5 rounded-lg">
                                {name}
                            </span>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* ═══ FREELANCE SECTION ═══ */}
            <motion.section
                id="freelance"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={sectionVariants}
                className="max-w-6xl mx-auto px-4 sm:px-6 mb-12 sm:mb-16"
            >
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 mb-6 text-center sm:text-left">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Briefcase className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">Freelance Jobs</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Client Projects</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {SAMPLE_JOBS.map((job, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }}
                            variants={cardVariants}
                            className="rounded-2xl bg-card border border-white/5 p-4 sm:p-5 group hover:border-blue-500/20 transition-all"
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <Briefcase className="h-4 w-4 text-blue-500" />
                                </div>
                                {job.daysAgo <= 1 && (
                                    <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/5 px-2 py-1 rounded-full border border-green-500/10">
                                        {job.daysAgo === 0 ? "Today" : "New"}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-[11px] sm:text-xs font-black text-foreground uppercase tracking-tight mb-2 line-clamp-1">{job.title}</h3>
                            <div className="flex flex-wrap gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span className="bg-muted/50 px-2 py-1 rounded-lg">{job.budget}</span>
                                <span className="bg-muted/50 px-2 py-1 rounded-lg">{job.location}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ═══ 3D ASSETS SECTION ═══ */}
            <motion.section
                id="assets"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={sectionVariants}
                className="max-w-6xl mx-auto px-4 sm:px-6 mb-32 sm:mb-36"
            >
                <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 mb-6 text-center sm:text-left">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-foreground uppercase tracking-tight">3D Asset Library</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Ready-to-Use Models & Textures</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {ASSETS_3D.map((asset, i) => (
                        <motion.div
                            key={i}
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-40px" }}
                            variants={cardVariants}
                            className="rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10 p-4 sm:p-5 group hover:border-purple-500/20 transition-all"
                        >
                            <div className="h-16 sm:h-20 rounded-xl bg-purple-500/5 flex items-center justify-center mb-3 group-hover:scale-[1.03] transition-transform">
                                <Layers className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400/50" />
                            </div>
                            <h3 className="text-[11px] sm:text-xs font-black text-foreground uppercase tracking-tight mb-1">{asset.title}</h3>
                            <p className="text-[9px] sm:text-[10px] font-bold text-purple-400/70 uppercase tracking-widest">{asset.items}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.section>

            {/* ═══ STICKY BOTTOM CTA ═══ */}
            <AnimatePresence>
                {!showForm && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
                    >
                        <div className="bg-background/90 backdrop-blur-xl border-t border-white/5">
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-3">
                                {/* Timer */}
                                <div className="flex items-center justify-center gap-1.5 mb-2">
                                    <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">Offer expires in</span>
                                    <div className="flex items-center gap-1">
                                        <span className="bg-foreground/5 text-foreground text-[11px] font-black px-1.5 py-0.5 rounded-md tracking-wider">{tH}</span>
                                        <span className="text-muted-foreground/40 text-[10px] font-bold">:</span>
                                        <span className="bg-foreground/5 text-foreground text-[11px] font-black px-1.5 py-0.5 rounded-md tracking-wider">{tM}</span>
                                        <span className="text-muted-foreground/40 text-[10px] font-bold">:</span>
                                        <span className="bg-foreground/5 text-foreground text-[11px] font-black px-1.5 py-0.5 rounded-md tracking-wider">{tS}</span>
                                    </div>
                                </div>
                                {/* CTA row */}
                                <div className="flex items-center justify-between gap-4">
                                    <div className="hidden sm:block">
                                        <p className="text-xs font-black text-foreground uppercase tracking-tight">3-Day Free Trial</p>
                                        <p className="text-[10px] font-medium text-muted-foreground">Full access to everything above. Cancel anytime.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="btn-gold w-full sm:w-auto px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] text-white shadow-gold-lg hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        Start Your 3-Day Free Trial <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ SLIDE-UP SIGNUP FORM ═══ */}
            <AnimatePresence>
                {showForm && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowForm(false)}
                        />
                        {/* Panel */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-background border-t border-white/10 shadow-2xl"
                        >
                            <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10 px-5 pt-3 pb-2 flex items-center justify-between border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-[11px] font-black text-foreground uppercase tracking-[0.1em]">Start Your Free Trial</span>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center hover:bg-muted/50 transition-colors"
                                >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>
                            <div className="px-5 py-6">
                                <PreviewSignupForm />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
