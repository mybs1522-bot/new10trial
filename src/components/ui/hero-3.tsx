"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
    tagline: string;
    title: React.ReactNode;
    description: string;
    ctaText: string;
    ctaSecondaryText?: string;
    onCtaClick?: () => void;
    onCtaSecondaryClick?: () => void;
    images: string[];
    className?: string;
}

const ActionButton = ({
    children,
    onClick,
    variant = "primary",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary";
}) => (
    <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={cn(
            "px-8 py-4 rounded-full font-bold text-[11px] uppercase tracking-[0.18em] transition-all duration-300",
            variant === "primary"
                ? "btn-primary text-white shadow-green-lg glow-pulse"
                : "border border-foreground/10 bg-white text-foreground hover:bg-foreground hover:text-white hover:border-foreground shadow-soft"
        )}
    >
        {children}
    </motion.button>
);

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

const FADE_IN_UP = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

const STAGGER_CONTAINER = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
    tagline,
    title,
    description,
    ctaText,
    ctaSecondaryText,
    onCtaClick,
    onCtaSecondaryClick,
    images,
    className,
}) => {
    const duplicatedImages = [...images, ...images, ...images];

    return (
        <section
            className={cn(
                "relative w-full min-h-[88vh] overflow-hidden bg-white flex flex-col items-center justify-start sm:justify-center text-center px-4 pt-24 sm:pt-0 pb-0",
                className
            )}
        >
            {/* Subtle green radial glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-[0.06] blur-[120px]"
                    style={{ background: "radial-gradient(circle, hsl(152,56%,45%), transparent 65%)" }}
                />
            </div>

            {/* Minimal dot grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, currentColor 0.5px, transparent 0.5px)",
                    backgroundSize: "32px 32px",
                }}
            />

            {/* Main content */}
            <motion.div
                className="z-10 flex flex-col items-center relative"
                variants={STAGGER_CONTAINER}
                initial="hidden"
                animate="show"
            >
                {/* Tagline */}
                <motion.div
                    variants={FADE_IN_UP}
                    className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-accent/12 bg-accent/[0.04] px-5 py-2"
                >
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-muted-foreground tracking-[0.15em] uppercase">
                        {tagline}
                    </span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    variants={STAGGER_CONTAINER}
                    className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-display font-extrabold tracking-tight text-foreground leading-[1.05] mb-5 max-w-4xl px-2"
                >
                    {typeof title === "string"
                        ? title.split(" ").map((word, i) => (
                            <motion.span key={i} variants={FADE_IN_UP} className="inline-block mr-[0.25em] last:mr-0">
                                {word}
                            </motion.span>
                        ))
                        : title}
                </motion.h1>

                {/* Description */}
                <motion.p
                    variants={FADE_IN_UP}
                    className="max-w-lg text-[15px] text-muted-foreground leading-relaxed mb-9 px-2"
                >
                    {description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div variants={FADE_IN_UP} className="flex flex-col sm:flex-row gap-3.5 items-center mb-28 sm:mb-36">
                    <ActionButton onClick={onCtaClick} variant="primary">
                        {ctaText}
                    </ActionButton>
                    {ctaSecondaryText && (
                        <ActionButton onClick={onCtaSecondaryClick} variant="secondary">
                            {ctaSecondaryText}
                        </ActionButton>
                    )}
                </motion.div>
            </motion.div>

            {/* Image Marquee – CSS-only for smooth GPU performance */}
            <style>{`
                @keyframes marquee-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .marquee-track {
                    display: flex;
                    gap: 1.25rem;
                    padding-top: 1rem;
                    animation: marquee-scroll 18s linear infinite;
                    will-change: transform;
                }
            `}</style>
            <div className="absolute bottom-0 left-0 w-full h-[30%] sm:h-[34%] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_75%,transparent)] pointer-events-none overflow-hidden">
                <div className="marquee-track">
                    {duplicatedImages.map((src, index) => (
                        <div
                            key={index}
                            className="relative aspect-[3/4] h-40 sm:h-44 md:h-60 flex-shrink-0"
                            style={{ transform: `rotate(${index % 3 === 0 ? -2.5 : index % 3 === 1 ? 1.5 : -1}deg)` }}
                        >
                            <img
                                src={src}
                                alt={`Design showcase ${index + 1}`}
                                loading="eager"
                                className="w-full h-full object-cover rounded-2xl shadow-lg"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/15 to-transparent" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
