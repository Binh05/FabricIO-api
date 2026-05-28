import { useCallback, useEffect, useRef, useState } from "react";
import { getPostComments } from "../services/postService";

export default function useInfiniteComments(postId, isOpen) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState("");

  const loadingRef = useRef(false);
  const fetchedPostRef = useRef(null);

  const loadComments = useCallback(
    async (targetPage = 1, reset = false) => {
      if (!postId) return;
      if (loadingRef.current) return;
      if (!hasNextPage && !reset) return;

      try {
        loadingRef.current = true;
        setError("");

        if (targetPage === 1) {
          setInitialLoading(true);
        } else {
          setLoading(true);
        }

        const response = await getPostComments({
          postId,
          Page: targetPage,
          PageSize: 5,
        });

        const nextComments = response?.items || response?.data || [];
        const nextPagination = response?.page || response?.pagination;

        const nextHasNextPage =
          nextPagination?.hasNextPage ??
          nextPagination?.hasNext ??
          nextComments.length === 5;

        setComments((prev) =>
          reset ? nextComments : [...prev, ...nextComments],
        );

        setPage(targetPage);
        setHasNextPage(nextHasNextPage);
      } catch (err) {
        setError(
          err?.response?.data?.message || err.message || "Load comments failed",
        );
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [postId, hasNextPage],
  );

  useEffect(() => {
    if (!isOpen || !postId) return;

    if (fetchedPostRef.current !== postId) {
      fetchedPostRef.current = postId;
      setComments([]);
      setPage(1);
      setHasNextPage(true);
      loadComments(1, true);
    }
  }, [isOpen, postId, loadComments]);

  const loadMore = useCallback(() => {
    if (loadingRef.current || initialLoading || !hasNextPage) return;
    loadComments(page + 1, false);
  }, [initialLoading, hasNextPage, loadComments, page]);

  const refetch = useCallback(async () => {
    setHasNextPage(true);
    setPage(1);
    await loadComments(1, true);
  }, [loadComments]);

  return {
    comments,
    loading,
    initialLoading,
    error,
    hasNextPage,
    loadMore,
    refetch,
    refresh: refetch,
  };
}
