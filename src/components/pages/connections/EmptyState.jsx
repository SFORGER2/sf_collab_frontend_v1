import { Button } from "@/components/ui/button";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex p-4 rounded-2xl bg-slate-800/50 border border-slate-700 mb-6">
        <Icon className="w-10 h-10 text-slate-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-300 mb-2">{title}</h3>
      <p className="text-slate-500 mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="bg-blue-600 hover:bg-blue-700 text-white">
          {action.label}
        </Button>
      )}
    </div>
  );
}