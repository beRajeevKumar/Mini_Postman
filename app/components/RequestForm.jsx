// app/components/RequestForm.jsx
"use client";

import { useState, useEffect } from "react";

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "OPTIONS",
  "HEAD",
];

export default function RequestForm({ onSend, isLoading, initialValues = {} }) {
  const [url, setUrl] = useState(
    initialValues.url || "https://jsonplaceholder.typicode.com/todos/1"
  );
  const [method, setMethod] = useState(initialValues.method || "GET");
  const [body, setBody] = useState(initialValues.body || "");
  const [headers, setHeaders] = useState(
    initialValues.headers || [{ key: "", value: "" }]
  );

  useEffect(() => {
    if (initialValues.url) setUrl(initialValues.url);
    if (initialValues.method) setMethod(initialValues.method);
    if (initialValues.body !== undefined) setBody(initialValues.body);
    if (initialValues.headers)
      setHeaders(
        initialValues.headers.length > 0
          ? initialValues.headers
          : [{ key: "", value: "" }]
      );
  }, [initialValues]);

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addHeaderRow = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeaderRow = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    if (newHeaders.length === 0) {
      setHeaders([{ key: "", value: "" }]);
    } else {
      setHeaders(newHeaders);
    }
  };

  const handleSubmit = () => {
    if (!url) {
      alert("Please enter a URL.");
      return;
    }

    const formattedHeaders = headers.reduce((acc, header) => {
      if (header.key) {
        acc[header.key] = header.value;
      }
      return acc;
    }, {});

    let parsedBody = body;
    if (method !== "GET" && method !== "HEAD" && body) {
      try {
        if (
          (body.trim().startsWith("{") && body.trim().endsWith("}")) ||
          (body.trim().startsWith("[") && body.trim().endsWith("]"))
        ) {
          parsedBody = JSON.parse(body);
        }
      } catch (e) {
        console.warn(
          "Body is not valid JSON, sending as plain text. Error:",
          e.message
        );
      }
    } else if (method === "GET" || method === "HEAD") {
      parsedBody = undefined;
    }

    onSend({
      url,
      method,
      body: parsedBody,
      headers: formattedHeaders,
    });
  };

  useEffect(() => {
    if ((method === "GET" || method === "HEAD") && body !== "") {
      setBody("");
    }
  }, [method, body]);

  return (
    <div className="border p-4 sm:p-6 rounded-lg shadow-lg w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-slate-900 dark:text-slate-100">
        Send Request
      </h2>

      <div className="flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-2 mb-4 sm:mb-6">
        <div className="flex-shrink-0 w-full sm:w-auto">
          <label htmlFor="method" className="block text-sm font-medium mb-1">
            Method
          </label>
          <select
            id="method"
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
            disabled={isLoading}
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow w-full">
          <label htmlFor="url" className="block text-sm font-medium mb-1">
            URL
          </label>
          <input
            type="text"
            name="url"
            id="url"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://api.example.com/data"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg font-medium mb-2 text-slate-800 dark:text-slate-200">
          Headers
        </h3>
        {headers.map((header, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              placeholder="Key"
              value={header.key}
              onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
              className="block w-full sm:w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Value"
              value={header.value}
              onChange={(e) =>
                handleHeaderChange(index, "value", e.target.value)
              }
              className="block w-full sm:w-1/2 px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => removeHeaderRow(index)}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              disabled={
                isLoading ||
                (headers.length === 1 && !headers[0].key && !headers[0].value)
              }
              aria-label="Remove header"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addHeaderRow}
          className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium focus:outline-none focus:underline"
          disabled={isLoading}
        >
          + Add Header
        </button>
      </div>

      {method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && (
        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg font-medium mb-2 text-slate-800 dark:text-slate-200">
            Body (JSON / Text)
          </h3>
          <textarea
            name="body"
            id="body"
            rows="6"
            className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
            placeholder='e.g., {"name": "Test"}'
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-4 w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:bg-indigo-300 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Sending...
          </>
        ) : (
          "Send"
        )}
      </button>
    </div>
  );
}
