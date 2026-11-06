import type { AuthCardProps } from "../types";

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <section
      aria-labelledby="auth-title"
      className="w-full rounded-card border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl animate-slide-up sm:p-8"
    >
      <header className="mb-6">
        <h1 id="auth-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </header>
      {children}
    </section>
  );
}
