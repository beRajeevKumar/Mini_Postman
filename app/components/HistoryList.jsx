"use client";
import { useState, useEffect } from "react";

const ClientOnlyFormattedDate = ({ dateString }) => {
  const [formattedDate, setFormattedDate] = useState("...");

  useEffect(() => {
    if (dateString) {
      try {
        setFormattedDate(new Date(dateString).toLocaleString());
      } catch (e) {
        setFormattedDate("Invalid Date");
      }
    } else {
      setFormattedDate("N/A");
    }
  }, [dateString]);

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400 mr-3">
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
  if (isLoading) {
    return (
      <div className="border p-4 rounded-lg shadow-md w-full mt-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          History
        </h2>
        <p className="text-gray-700 dark:text-gray-300">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border p-4 rounded-lg shadow-md w-full mt-6 bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700">
        <h2 className="text-xl font-semibold mb-4 text-red-700 dark:text-red-200">
          History Error
        </h2>
        <pre className="bg-red-100 dark:bg-red-800 p-2 rounded text-sm text-red-700 dark:text-red-100 overflow-x-auto">
          {typeof error === "object"
            ? JSON.stringify(error, null, 2)
            : String(error)}
        </pre>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="border p-4 rounded-lg shadow-md w-full mt-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          History
        </h2>
        <p className="text-gray-700 dark:text-gray-300">No history yet.</p>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-lg shadow-md w-full mt-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        History
      </h2>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {history.map((item) => (
          <li key={item.id} className="py-3">
            <div className="flex items-center justify-between gap-2">
              {" "}
              <div className="flex-grow min-w-0">
                {" "}
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded mr-2 whitespace-nowrap ${
                    item.responseStatus >= 200 && item.responseStatus < 300
                      ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
                      : item.responseStatus >= 400
                      ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100"
                  }`}
                >
                  {item.method.toUpperCase()} {item.responseStatus || "N/A"}
                </span>
                <span
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 truncate inline-block align-middle"
                  title={item.url}
                >
                  {item.url}
                </span>
              </div>
              <div className="ml-2 flex-shrink-0 flex items-center gap-2">
                {" "}
                <ClientOnlyFormattedDate dateString={item.createdAt} />
                <button
                  onClick={() => onReplay(item)}
                  className="text-xs px-2 py-1 border border-indigo-500 text-indigo-500 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900 dark:hover:text-indigo-300 rounded transition-colors"
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
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium">{pagination.page}</span> of{" "}
              <span className="font-medium">{pagination.totalPages}</span>{" "}
              (Total:{" "}
              <span className="font-medium">{pagination.totalItems}</span>{" "}
              items)
            </p>
          </div>
          <div className="flex-1 flex justify-end space-x-3">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
