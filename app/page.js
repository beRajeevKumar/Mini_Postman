// app/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import RequestForm from "./components/RequestForm";
import ResponseDisplay from "./components/ResponseDisplay";
import HistoryList from "./components/HistoryList";
import ThemeToggleButton from "./components/ThemeToggleButton"; // Added import

export default function Home() {
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyPagination, setHistoryPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [requestFormValues, setRequestFormValues] = useState({});

  const fetchHistory = useCallback(async (pageToFetch, limitToFetch) => {
    console.log(
      "[Page] fetchHistory called with page:",
      pageToFetch,
      "limit:",
      limitToFetch
    );
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const validPage = Number(pageToFetch) || 1;
      const validLimit = Number(limitToFetch) || 10;

      const res = await fetch(
        `/api/history?page=${validPage}&limit=${validLimit}`
      );
      const data = await res.json();

      if (!res.ok) {
        console.error("[Page] Error fetching history:", data);
        throw data;
      }
      setHistory(data.data);
      setHistoryPagination(data.pagination); // This updates the state correctly
      console.log("[Page] History updated:", data.data, data.pagination);
    } catch (err) {
      console.error("[Page] Frontend history error:", err);
      setHistoryError(
        err.error
          ? err
          : { error: "Failed to fetch history", details: err.message || err }
      );
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log(
      "[Page] useEffect for fetchHistory triggered. Current pagination page:",
      historyPagination.page,
      "limit:",
      historyPagination.limit
    );
    fetchHistory(historyPagination.page, historyPagination.limit);
  }, [fetchHistory, historyPagination.page, historyPagination.limit]); // Correct dependencies

  const handleSendRequest = async (requestDetails) => {
    console.log("[Page] handleSendRequest called with:", requestDetails);
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setRequestFormValues({}); // Clear replayed values after sending

    try {
      console.log("[Page] Fetching /api/send-request...");
      const res = await fetch("/api/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestDetails),
      });

      console.log("[Page] Raw response from /api/send-request:", res);
      const data = await res.json();
      console.log("[Page] Parsed data from /api/send-request:", data);

      if (!res.ok) {
        console.error(
          "[Page] /api/send-request returned an error status:",
          res.status,
          data
        );
        throw data.error
          ? data
          : { error: `API Error ${res.status}`, details: data };
      }

      setResponse(data);
      console.log("[Page] Response state updated.");
      // Fetch history, ensuring it goes to the first page to see the new item.
      // Also, use the current limit from pagination state.
      if (historyPagination) {
        fetchHistory(1, historyPagination.limit);
      } else {
        fetchHistory(1, 10); // Fallback
      }
    } catch (err) {
      console.error("[Page] Error in handleSendRequest catch block:", err);
      let errDetails = "An unknown error occurred.";
      if (typeof err === "string") errDetails = err;
      else if (err.message) errDetails = err.message;
      else if (typeof err === "object" && err !== null)
        errDetails = JSON.stringify(err);

      setError(
        err.error ? err : { error: "Request Failed", details: errDetails }
      );
    } finally {
      setIsLoading(false);
      console.log("[Page] setIsLoading(false) in handleSendRequest");
    }
  };

  const handlePageChange = (newPage) => {
    console.log("[Page] handlePageChange called with newPage:", newPage);
    // Update the state, the useEffect will handle fetching
    if (
      historyPagination &&
      newPage >= 1 &&
      newPage <= historyPagination.totalPages
    ) {
      setHistoryPagination((prev) => ({ ...prev, page: newPage }));
    } else if (newPage >= 1) {
      // If totalPages isn't known yet but newPage is valid
      setHistoryPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleReplayRequest = (historyItem) => {
    console.log("[Page] handleReplayRequest called with item:", historyItem);
    let formHeaders = [];
    if (
      historyItem.requestHeaders &&
      typeof historyItem.requestHeaders === "object"
    ) {
      formHeaders = Object.entries(historyItem.requestHeaders).map(
        ([key, value]) => ({ key, value: String(value) })
      );
    }

    if (formHeaders.length === 0) {
      formHeaders.push({ key: "", value: "" });
    }

    const formValues = {
      url: historyItem.url,
      method: historyItem.method.toUpperCase(),
      body:
        historyItem.requestBody && typeof historyItem.requestBody === "object"
          ? JSON.stringify(historyItem.requestBody, null, 2)
          : String(historyItem.requestBody || ""),
      headers: formHeaders,
    };
    setRequestFormValues(formValues);
    window.scrollTo(0, 0);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-16 space-y-8 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100">
            Mini Postman Clone
          </h1>
          <ThemeToggleButton /> {/* Added ThemeToggleButton */}
        </div>

        <RequestForm
          key={JSON.stringify(requestFormValues)}
          onSend={handleSendRequest}
          isLoading={isLoading}
          initialValues={requestFormValues}
        />

        <ResponseDisplay
          response={response}
          isLoading={isLoading}
          error={error}
        />

        <HistoryList
          history={history}
          pagination={historyPagination}
          isLoading={isHistoryLoading}
          error={historyError}
          onPageChange={handlePageChange}
          onReplay={handleReplayRequest}
        />
      </div>
    </main>
  );
}
