import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "No suitable collaborators found",
  description = "Try updating your Required Roles, Industry or Technology Stack to get better AI recommendations.",
}) {
  return (
    <section className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-8 py-16 text-center shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
        <SearchX
          size={42}
          className="text-zinc-500"
        />
      </div>

      <h2 className="mt-6 text-2xl font-semibold text-zinc-900">
        {title}
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-zinc-500">
        {description}
      </p>

      <div className="mt-8 rounded-xl bg-zinc-50 p-6">
        <h3 className="mb-4 font-medium text-zinc-800">
          Suggestions
        </h3>

        <ul className="space-y-2 text-sm text-zinc-600">
          <li>• Update Required Roles</li>
          <li>• Select a different Industry</li>
          <li>• Improve Technology Stack</li>
        </ul>
      </div>
    </section>
  );
}