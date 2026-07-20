import { useCallback, useEffect, useRef, useState } from "react";
import useInfiniteObserver from "./useInfiniteObserver";

export default function usePaginatedFetch({
  fetchFn,
  objectKey = "",
  search = "",
  enabled = true,
  startPage = 1,
  searchDelay = 400, // ⬅ debounce time (ms)
  totalAmountKey = "total_amount",
}) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(startPage);
  const [perPage, setPerPage] = useState(null);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [pages, setPages] = useState(null);
  const [loading, setLoading] = useState(false);

  const targetRef = useRef(null);
  const searchTimeout = useRef(null);

  const hasMore = pages === null ? true : page <= pages;


  const loadMore = useCallback(async () => {
    if (!enabled || loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetchFn({ page, search });
      console.log("Res from use paginated");
      console.log(res);
      if (!res?.data) return;

      const newItems = res.data?.[objectKey] ?? [];

      if (newItems.length === 0) {
        setPages(page - 1); // stop infinite loop
        return;
      }

      setItems((prev) =>
        page === startPage ? newItems : [...prev, ...newItems]
      );

      setPerPage(res.data.pagination.per_page);
      if (res.data.pagination[totalAmountKey] !== undefined) {
        setTotalAmount(res.data.pagination[totalAmountKey]);
      }
      setTotal(res.data.pagination.total);
      setPages(res.data.pagination.pages);

      setPage((p) => p + 1);
    } catch (e) {
      console.error("Failed to load paginated data:", e);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, search, enabled, loading, hasMore, objectKey, startPage, totalAmountKey]);

  // Infinite scroll
  useInfiniteObserver({
    targetRef,
    onIntersect: loadMore,
    enabled,
  });

  // 🔁 Debounced search reset
  useEffect(() => {
    if (!enabled) return;

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setItems([]);
      setPage(startPage);
      setTotal(0);
      setPages(null);
    }, searchDelay);

    return () => clearTimeout(searchTimeout.current);
  }, [search, enabled, startPage, searchDelay]);
  useEffect(() => {
    if (!enabled) return;
    if (items.length > 0) return; // already loaded

    loadMore();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, items.length]);

  return {
    items,
    setItems,

    page: page - 1,
    perPage,
    total,
    totalAmount,
    pages,
    hasMore,

    loading,
    targetRef,

    refetch: () => {
      setItems([]);
      setPage(startPage);
      setTotal(0);
      setPages(null);
    },
  };
}
