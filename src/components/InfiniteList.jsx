export default function InfiniteList({
  items,
  renderItem,
  loading,
  sentinelRef,
  emptyText = "No items found",
  containerClassName = "",
}) {
  if (!items) return null;

  return (
    <>
      {items.length === 0 && !loading && (
        <p className="text-sm text-gray-400">{emptyText}</p>
      )}


        {items.map(renderItem)}

      <div ref={sentinelRef} className="h-10 flex items-center justify-center">
        {loading && (
          <span className="text-xs text-gray-500">Loading more...</span>
        )}
      </div>
    </>
  );
}
