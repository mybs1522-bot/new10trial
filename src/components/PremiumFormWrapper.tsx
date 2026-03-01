import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface PremiumFormWrapperProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: React.ReactNode;
}

export const itemVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.4, ease: "easeOut" },
    },
};

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.05,
        },
    },
};

export const PremiumFormWrapper = React.forwardRef<HTMLDivElement, PremiumFormWrapperProps>(
    ({ className, children, title, subtitle, icon, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={cn(
                    'w-full space-y-5 rounded-2xl p-6 sm:p-8',
                    className
                )}
                {...props}
            >
                {(title || icon) && (
                    <motion.div variants={itemVariants} className="space-y-1">
                        <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2.5">
                            {icon}
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-[11px] font-medium text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                )}
                {children}
            </motion.div>
        );
    }
);

PremiumFormWrapper.displayName = 'PremiumFormWrapper';
