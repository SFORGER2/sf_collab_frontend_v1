import { Card } from "@/components/ui/card";

export default function StartupCardSkeleton() {
  return (
    <Card className="p-6 border-gray-700 bg-black">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 bg-gray-700 rounded-xl shrink-0 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>
        <div className="h-6 bg-gray-700 rounded w-16 animate-pulse"></div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-3 bg-gray-700 rounded w-5/6 animate-pulse"></div>
      </div>
      <div className="h-12 bg-gray-700 rounded mb-4 animate-pulse"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-700 rounded w-16 animate-pulse"></div>
        <div className="h-6 bg-gray-700 rounded w-20 animate-pulse"></div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-700">
        <div className="flex gap-4">
          <div className="h-3 bg-gray-700 rounded w-12 animate-pulse"></div>
          <div className="h-3 bg-gray-700 rounded w-16 animate-pulse"></div>
        </div>
        <div className="h-8 bg-gray-700 rounded w-20 animate-pulse"></div>
      </div>
    </Card>
  );
}
