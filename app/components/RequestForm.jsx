"use client";

import { useState } from "react";

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
    setHeaders(newHeaders);
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

  useState(() => {
    if ((method === "GET" || method === "HEAD") && body !== "") {
      setBody("");
    }
  }, [method]);

  return (
    <div className="border p-4 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Send Request</h2>

      <div className="flex items-end space-x-2 mb-4">
        <div className="flex-shrink-0">
          <label
            htmlFor="method"
            className="block text-sm font-medium text-gray-700"
          >
            Method
          </label>
          <select
            id="method"
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            disabled={isLoading}
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-grow">
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700"
          >
            URL
          </label>
          <input
            type="text"
            name="url"
            id="url"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://api.example.com/data"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Headers</h3>
        {headers.map((header, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              placeholder="Key"
              value={header.key}
              onChange={(e) => handleHeaderChange(index, "key", e.target.value)}
              className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Value"
              value={header.value}
              onChange={(e) =>
                handleHeaderChange(index, "value", e.target.value)
              }
              className="block w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => removeHeaderRow(index)}
              className="text-red-500 hover:text-red-700 px-2 py-1 disabled:opacity-50"
              disabled={
                isLoading ||
                (headers.length === 1 &&
                  header.key === "" &&
                  header.value === "")
              }
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addHeaderRow}
          className="text-sm text-indigo-600 hover:text-indigo-800"
          disabled={isLoading}
        >
          + Add Header
        </button>
      </div>

      {method !== "GET" && method !== "HEAD" && method !== "OPTIONS" && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Body (JSON / Text)
          </h3>
          <textarea
            name="body"
            id="body"
            rows="5"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
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
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}
