import * as React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { itemVariants } from './PremiumFormWrapper';

export interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    label?: string;
}

export const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
    ({ className, icon, label, id, placeholder, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            props.onFocus?.(e);
        };

        const isFloating = isFocused || hasValue;

        return (
            <motion.div variants={itemVariants} className="space-y-1.5 w-full">
                <div className="relative group typing-glow">
                    {icon && (
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 text-black/55 transition-all duration-300 z-10",
                            isFocused ? "text-accent scale-110" : "scale-100",
                            isFloating && "translate-y-1"
                        )}>
                            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={id}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className={cn(
                            'premium-input floating-input',
                            icon && 'floating-input-with-icon',
                            className
                        )}
                        {...props}
                    />

                    <label
                        htmlFor={id}
                        className={cn(
                            "absolute left-4 transition-all duration-300 pointer-events-none select-none",
                            icon && "left-12",
                            isFloating
                                ? "top-2 text-[10px] font-bold text-accent uppercase tracking-wider"
                                : "top-1/2 -translate-y-1/2 text-[14px] font-semibold text-black"
                        )}
                    >
                        {label || placeholder}
                    </label>

                    {/* Subtle underline glow on focus */}
                    <div className={cn(
                        "absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500 rounded-full",
                        isFocused ? "w-full opacity-100" : "w-0 opacity-0"
                    )} />
                </div>
            </motion.div>
        );
    }
);
PremiumInput.displayName = 'PremiumInput';

export interface PremiumSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon?: React.ReactNode;
    label?: string;
}

export const PremiumSelect = React.forwardRef<HTMLSelectElement, PremiumSelectProps>(
    ({ className, icon, label, id, children, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(!!props.value);

        const isFloating = isFocused || hasValue || !!props.value;

        return (
            <motion.div variants={itemVariants} className="space-y-1.5 w-full">
                <div className="relative group">
                    {icon && (
                        <div className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 text-black/55 transition-all duration-300 z-10",
                            isFocused ? "text-accent" : "",
                            isFloating && "translate-y-1"
                        )}>
                            {React.cloneElement(icon as React.ReactElement, { size: 18 })}
                        </div>
                    )}

                    <select
                        ref={ref}
                        id={id}
                        onFocus={() => setIsFocused(true)}
                        onBlur={(e) => { setIsFocused(false); setHasValue(!!e.target.value); }}
                        className={cn(
                            'premium-input appearance-none cursor-pointer floating-input',
                            icon && 'floating-input-with-icon',
                            className
                        )}
                        {...props}
                    >
                        {children}
                    </select>

                    <label
                        htmlFor={id}
                        className={cn(
                            "absolute left-4 transition-all duration-300 pointer-events-none",
                            icon && "left-12",
                            isFloating
                                ? "top-2 text-[10px] font-bold text-accent uppercase tracking-wider"
                                : "top-1/2 -translate-y-1/2 text-[14px] font-semibold text-black"
                        )}
                    >
                        {label}
                    </label>

                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <div className={cn(
                        "absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500 rounded-full",
                        isFocused ? "w-full opacity-100" : "w-0 opacity-0"
                    )} />
                </div>
            </motion.div>
        );
    }
);
PremiumSelect.displayName = 'PremiumSelect';

export interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

export const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
    ({ className, label, id, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue);

        const isFloating = isFocused || hasValue;

        return (
            <motion.div variants={itemVariants} className="space-y-1.5 w-full">
                <div className="relative group typing-glow">
                    <textarea
                        ref={ref}
                        id={id}
                        onFocus={() => setIsFocused(true)}
                        onBlur={(e) => { setIsFocused(false); setHasValue(!!e.target.value); }}
                        className={cn(
                            'w-full rounded-xl border border-border bg-background px-4 pt-6 pb-2 text-[14px] font-medium text-foreground placeholder:opacity-0 focus:outline-none focus:border-accent transition-all duration-300 resize-none min-h-[100px]',
                            className
                        )}
                        {...props}
                    />
                    <label
                        htmlFor={id}
                        className={cn(
                            "absolute left-4 transition-all duration-300 pointer-events-none",
                            isFloating
                                ? "top-2 text-[10px] font-bold text-accent uppercase tracking-wider"
                                : "top-5 text-[14px] font-semibold text-black"
                        )}
                    >
                        {label}
                    </label>
                    <div className={cn(
                        "absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500 rounded-full",
                        isFocused ? "w-full opacity-100" : "w-0 opacity-0"
                    )} />
                </div>
            </motion.div>
        );
    }
);
PremiumTextarea.displayName = 'PremiumTextarea';
