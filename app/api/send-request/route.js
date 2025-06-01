import axios from "axios";
import { NextResponse } from "next/server";
import { getEM } from "../../../lib/db";
import { RequestHistory } from "../../../lib/entities/RequestHistory.entity.js";

export async function POST(request) {
  console.log("[/api/send-request] POST request received");
  const em = await getEM();
  let requestDetailsForDb;

  try {
    const rawBody = await request.json();
    console.log(
      "[/api/send-request] Received rawBody from frontend:",
      JSON.stringify(rawBody, null, 2)
    );

    const {
      url,
      method,
      body: requestBodyInput,
      headers: requestHeadersInput,
    } = rawBody;

    requestDetailsForDb = {
      url,
      method: method ? method.toLowerCase() : "get",

      requestBody:
        requestBodyInput && typeof requestBodyInput === "object"
          ? JSON.stringify(requestBodyInput)
          : requestBodyInput,
      requestHeaders: requestHeadersInput || {},
    };

    if (!requestDetailsForDb.url) {
      console.error("[/api/send-request] URL is required, returning 400");
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const options = {
      method: requestDetailsForDb.method,
      url: requestDetailsForDb.url,
      headers: requestDetailsForDb.requestHeaders,
      data: requestBodyInput,
      validateStatus: function (status) {
        return status >= 100 && status < 600;
      },
    };

    console.log(
      "Making request to external API with options:",
      JSON.stringify(options, null, 2)
    );
    const externalResponse = await axios(options);
    console.log(
      "[/api/send-request] Response from external API Status:",
      externalResponse.status
    );

    const historyEntry = new RequestHistory(
      requestDetailsForDb.method,
      requestDetailsForDb.url,
      requestDetailsForDb.requestHeaders,
      requestDetailsForDb.requestBody,
      externalResponse.status,
      externalResponse.headers,
      externalResponse.data && typeof externalResponse.data === "object"
        ? JSON.stringify(externalResponse.data)
        : externalResponse.data
    );

    await em.persistAndFlush(historyEntry);
    console.log("Saved to history, ID:", historyEntry.id);

    console.log(
      "[/api/send-request] Returning successful response to frontend."
    );
    return NextResponse.json({
      status: externalResponse.status,
      statusText: externalResponse.statusText,
      headers: externalResponse.headers,
      data: externalResponse.data,
    });
  } catch (error) {
    console.error(
      "!!! [/api/send-request] Error in /api/send-request catch block !!!"
    );
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    if (error.response) {
      console.error("Axios Error Response Data:", error.response.data);
      console.error("Axios Error Response Status:", error.response.status);
      console.error("Axios Error Response Headers:", error.response.headers);
    } else if (error.request) {
      console.error("Axios Error Request Data:", error.request);
    }

    let errorResponseStatus = 500;
    let errorResponseJson = {
      error: "Internal Server Error",
      details: error.message,
    };

    if (requestDetailsForDb && requestDetailsForDb.url) {
      try {
        const errorEntry = new RequestHistory(
          requestDetailsForDb.method,
          requestDetailsForDb.url,
          requestDetailsForDb.requestHeaders,
          requestDetailsForDb.requestBody,
          error.response?.status || 0,
          error.response?.headers || {
            error_detail: "No headers available on error",
          },
          error.response?.data && typeof error.response.data === "object"
            ? JSON.stringify(error.response.data)
            : error.response?.data || {
                error_detail: "Error during request: " + error.message,
              }
        );
        await em.persistAndFlush(errorEntry);
        console.log("Saved error request to history, ID:", errorEntry.id);
      } catch (dbError) {
        console.error(
          "Failed to save error request to history during main error handling:",
          dbError.message
        );
      }
    }

    if (error.response) {
      errorResponseStatus = error.response.status;
      errorResponseJson = {
        error: "External API Error",
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
      };
    } else if (error.request) {
      errorResponseJson = {
        error: "No response received from external API",
        details: "The server did not respond to the request.",
      };
    }

    console.log(
      "[/api/send-request] Returning error response to frontend with status:",
      errorResponseStatus
    );
    return NextResponse.json(errorResponseJson, {
      status: errorResponseStatus,
    });
  }
}
