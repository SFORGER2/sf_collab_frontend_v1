import { Card } from "../../ui/card";

export default function UserCardSkeleton() {
  return (
    <Card className="p-6 border-slate-700 bg-slate-800/50 h-full">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-slate-700 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-700 rounded w-1/2" />
          <div className="h-3 bg-slate-700 rounded w-2/3" />
        </div>
      </div>
      <div className="h-8 bg-slate-700 rounded mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-slate-700 rounded w-20" />
        <div className="h-6 bg-slate-700 rounded w-24" />
      </div>
      <div className="h-8 bg-slate-700 rounded mb-4" />
      <div className="flex gap-2">
        <div className="flex-1 h-8 bg-slate-700 rounded" />
        <div className="flex-1 h-8 bg-slate-700 rounded" />
      </div>
    </Card>
  );
}