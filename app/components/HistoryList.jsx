"use client";
import { useState, useEffect } from "react";

const ClientOnlyFormattedDate = ({ dateString }) => {
  const [formattedDate, setFormattedDate] = useState("...");

  useEffect(() => {
    if (dateString) {
      try {
        setFormattedDate(
          new Date(dateString).toLocaleString(undefined, {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: false,
          })
        );
      } catch (e) {
        setFormattedDate("Invalid Date");
      }
    } else {
      setFormattedDate("N/A");
    }
  }, [dateString]);

  return (
    <span className="text-xs text-slate-500 dark:text-slate-400 mr-2 sm:mr-3 whitespace-nowrap">
      {formattedDate}
    </span>
  );
};

export default function HistoryList({
  history,
  pagination,
  isLoading,
  error,
  onPageChange,
  onReplay,
}) {
  const containerClasses =
    "border p-4 sm:p-6 rounded-lg shadow-lg w-full mt-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700";
  const headingClasses =
    "text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100";

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <h2 className={headingClasses}>History</h2>
        <p className="text-slate-600 dark:text-slate-400">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`${containerClasses} bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700`}
      >
        <h2 className={`${headingClasses} text-red-600 dark:text-red-400`}>
          History Error
        </h2>
        <pre className="bg-red-100 dark:bg-red-800/50 p-2 rounded text-sm text-red-700 dark:text-red-200 overflow-x-auto font-mono">
          {typeof error === "object" && error !== null
            ? JSON.stringify(error.details || error, null, 2)
            : String(error)}
        </pre>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className={containerClasses}>
        <h2 className={headingClasses}>History</h2>
        <p className="text-slate-600 dark:text-slate-400">
          No history yet. Make some requests!
        </p>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <h2 className={headingClasses}>History</h2>
      <ul className="divide-y divide-slate-200 dark:divide-slate-700">
        {history.map((item) => (
          <li key={item.id} className="py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex-grow min-w-0 mb-2 sm:mb-0">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded mr-2 whitespace-nowrap ${
                    item.responseStatus >= 200 && item.responseStatus < 300
                      ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                      : item.responseStatus >= 400
                      ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                      : item.responseStatus >= 300 && item.responseStatus < 400
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100"
                  }`}
                >
                  {item.method.toUpperCase()} {item.responseStatus || "N/A"}
                </span>
                <span
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 truncate inline-block align-middle"
                  title={item.url}
                >
                  {item.url}
                </span>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                <ClientOnlyFormattedDate dateString={item.createdAt} />
                <button
                  onClick={() => onReplay(item)}
                  type="button"
                  className="text-xs px-3 py-1.5 border border-indigo-500 hover:border-indigo-600 text-indigo-600 hover:text-indigo-700 dark:border-indigo-600 dark:hover:border-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-700/20 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                  title="Replay this request"
                >
                  Replay
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4 gap-3">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Page{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {pagination.totalPages}
              </span>{" "}
              (Total:{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {pagination.totalItems}
              </span>{" "}
              items)
            </p>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              type="button"
              className="relative inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              type="button"
              className="relative inline-flex items-center px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 dark:focus:ring-offset-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
