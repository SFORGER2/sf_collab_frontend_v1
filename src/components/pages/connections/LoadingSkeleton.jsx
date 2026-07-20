import { Card } from "@/components/ui/card";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5 bg-slate-800/50 border-slate-700 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-700 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-700 rounded w-1/3" />
              <div className="h-3 bg-slate-700 rounded w-1/4" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}