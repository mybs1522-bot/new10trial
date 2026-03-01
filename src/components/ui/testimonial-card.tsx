import { cn } from "@/lib/utils"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

export interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
  className?: string
}

export function TestimonialCard({
  author,
  text,
  href,
  className
}: TestimonialCardProps) {
  const Card = href ? 'a' : 'div'

  return (
    <Card
      {...(href ? { href } : {})}
      className={cn(
        "flex flex-col rounded-2xl border border-border/40",
        "bg-white",
        "p-5 sm:p-6 text-start",
        "hover:shadow-lift hover:border-accent/15",
        "max-w-[320px] sm:max-w-[320px]",
        "transition-all duration-400",
        className
      )}
    >
      <p className="text-[13.5px] leading-relaxed text-muted-foreground mb-5">
        "{text}"
      </p>
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/30">
        <Avatar className="h-9 w-9 ring-2 ring-accent/10">
          <AvatarImage src={author.avatar} alt={author.name} />
        </Avatar>
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold leading-none text-foreground">
            {author.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {author.handle}
          </p>
        </div>
      </div>
    </Card>
  )
}