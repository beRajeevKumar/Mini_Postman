const JsonPretty = ({ data }) => {
  try {
    return (
      <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap break-all">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  } catch (e) {
    return (
      <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto text-red-500">
        Error parsing JSON.
      </pre>
    );
  }
};

export default function ResponseDisplay({ response, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="border p-4 rounded-lg shadow-md w-full mt-6">
        <h2 className="text-xl font-semibold mb-4">Response</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border p-4 rounded-lg shadow-md w-full mt-6">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Error</h2>
        <JsonPretty data={error} />
      </div>
    );
  }

  if (!response) {
    return (
      <div className="border p-4 rounded-lg shadow-md w-full mt-6">
        <h2 className="text-xl font-semibold mb-4">Response</h2>
        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
          Waiting for response...
        </pre>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-lg shadow-md w-full mt-6">
      <h2 className="text-xl font-semibold mb-2">Response</h2>

      <div className="mb-4">
        <span
          className={`px-2 py-1 text-xs font-semibold rounded ${
            response.status >= 200 && response.status < 300
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          Status: {response.status} {response.statusText}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-1">Headers:</h3>
        <JsonPretty data={response.headers} />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-1">Body:</h3>
        <JsonPretty data={response.data} />
      </div>
    </div>
  );
}
