export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-zinc-600 mb-4">{icon}</div>
    <h3 className="text-lg font-medium text-white">{title}</h3>
    <p className="text-sm text-zinc-500 mt-1 max-w-sm">{description}</p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);
