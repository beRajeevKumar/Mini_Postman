// app/components/ResponseDisplay.jsx

const JsonPretty = ({ data }) => {
  try {
    let content = data;
    if (typeof data === "string") {
      try {
        // Try to parse if it's a JSON string, then re-stringify to pretty print
        const parsed = JSON.parse(data);
        content = JSON.stringify(parsed, null, 2);
      } catch (e) {
        // If it's a string but not JSON, display as is
        content = data;
      }
    } else {
      // If it's already an object/array, stringify it
      content = JSON.stringify(data, null, 2);
    }
    return (
      <pre className="bg-slate-100 dark:bg-slate-700 p-3 sm:p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap break-all text-slate-800 dark:text-slate-200 font-mono">
        {content}
      </pre>
    );
  } catch (e) {
    return (
      <pre className="bg-red-50 dark:bg-red-900 p-3 sm:p-4 rounded-md text-sm overflow-x-auto text-red-700 dark:text-red-300 font-mono">
        Error displaying data. Could not stringify.
      </pre>
    );
  }
};

export default function ResponseDisplay({ response, isLoading, error }) {
  const containerClasses =
    "border p-4 sm:p-6 rounded-lg shadow-lg w-full mt-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300";
  const headingClasses =
    "text-xl sm:text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100";
  const subHeadingClasses =
    "text-lg font-medium mb-2 text-slate-800 dark:text-slate-200";

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <h2 className={headingClasses}>Response</h2>
        <div className="flex items-center justify-center py-10">
          <svg
            className="animate-spin h-8 w-8 text-indigo-500 dark:text-indigo-400"
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
          <p className="ml-3 text-slate-600 dark:text-slate-400">
            Loading response...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClasses}>
        <h2 className={`${headingClasses} text-red-600 dark:text-red-400`}>
          Error
        </h2>
        <div className="max-h-96 overflow-y-auto p-1">
          <JsonPretty data={error.details || error} />
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className={containerClasses}>
        <h2 className={headingClasses}>Response</h2>
        <pre className="bg-slate-100 dark:bg-slate-700 p-3 sm:p-4 rounded-md text-sm overflow-x-auto text-slate-500 dark:text-slate-400 font-mono">
          Waiting for response... Make a request to see data here.
        </pre>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <h2 className={headingClasses}>Response</h2>

      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700/50 rounded-md">
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">
          Status
        </h3>
        <span
          className={`px-3 py-1 text-sm font-bold rounded-full inline-block ${
            response.status >= 200 && response.status < 300
              ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100"
              : response.status >= 400
              ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100"
              : response.status >= 300 && response.status < 400
              ? "bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100"
          }`}
        >
          {response.status} {response.statusText || ""}
        </span>
      </div>

      <div className="mb-4 sm:mb-6">
        <h3 className={subHeadingClasses}>Headers:</h3>
        <div className="max-h-60 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700">
          <JsonPretty data={response.headers} />
        </div>
      </div>

      <div>
        <h3 className={subHeadingClasses}>Body:</h3>
        <div className="max-h-96 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700">
          <JsonPretty data={response.data} />
        </div>
      </div>
    </div>
  );
}
