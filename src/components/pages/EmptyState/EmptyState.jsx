import { SearchX } from "lucide-react";
import { Eyebrow } from "@/components/cosmos";

/**
 * Empty state for matchmaking and discovery results.
 *
 * Was built light-theme (bg-white, zinc-900 text) on a dark app, so it rendered
 * as a white slab with unreadable copy.
 */
export default function EmptyState({
  title = "No suitable collaborators found",
  description = "Try updating your required roles, industry or technology stack to get better AI recommendations.",
}) {
  return (
    <section
      className="cosmos-panel flex flex-col items-center justify-center px-8 py-14 text-center"
      style={{ "--cosmos-accent": "#4fd8ff" }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan/10">
        <SearchX size={32} className="text-cyan" />
      </div>

      <h2 className="mt-5 font-display text-[1.25rem] text-star">{title}</h2>

      <p className="mt-2.5 max-w-md text-[0.9rem] leading-6 text-dim">{description}</p>

      <div className="mt-7 cosmos-card p-5 text-left w-full max-w-sm">
        <Eyebrow className="mb-3">Suggestions</Eyebrow>
        <ul className="flex flex-col gap-2 text-[0.88rem] text-dim">
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-cyan mt-2 shrink-0" />
            Add the roles you actually need
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-cyan mt-2 shrink-0" />
            Try a broader industry
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-cyan mt-2 shrink-0" />
            Widen your technology stack
          </li>
        </ul>
      </div>
    </section>
  );
}
