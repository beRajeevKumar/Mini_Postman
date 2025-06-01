import axios from "axios";
import { NextResponse } from "next/server";
import { getEM } from "../../../lib/db";
import { RequestHistory } from "../../../lib/entities/RequestHistory.entity.js";

export async function POST(request) {
  console.log(
    "[/api/send-request] POST request received. Attempting to get EntityManager..."
  );
  let em;
  try {
    em = await getEM();
    console.log("[/api/send-request] EntityManager obtained successfully.");
  } catch (dbError) {
    console.error(
      "!!! [/api/send-request] CRITICAL: Failed to obtain EntityManager !!!"
    );
    console.error("Database Initialization/Connection Error:", dbError.message);
    return NextResponse.json(
      { error: "Database service unavailable", details: dbError.message },
      { status: 503 }
    );
  }

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
      "[/api/send-request] Making request to external API with options:",
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
    console.log("[/api/send-request] Saved to history, ID:", historyEntry.id);

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
      "!!! [/api/send-request] Error occurred after obtaining EntityManager !!!"
    );
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    if (error.isAxiosError && error.response) {
      console.error("Axios Error Response Status:", error.response.status);
      console.error("Axios Error Response Data:", error.response.data);
    } else if (error.isAxiosError && error.request) {
      console.error(
        "Axios Error: No response received. Request details:",
        error.request
      );
    }

    let errorResponseStatus = 500;
    let errorResponseJson = {
      error: "Internal Server Error",
      details: error.message,
    };

    if (requestDetailsForDb && requestDetailsForDb.url && em) {
      try {
        const errorDataToStore =
          error.isAxiosError && error.response?.data
            ? error.response.data
            : { error_detail: "Error during request: " + error.message };

        const errorEntry = new RequestHistory(
          requestDetailsForDb.method,
          requestDetailsForDb.url,
          requestDetailsForDb.requestHeaders,
          requestDetailsForDb.requestBody,
          error.isAxiosError && error.response?.status
            ? error.response.status
            : 0,
          error.isAxiosError && error.response?.headers
            ? error.response.headers
            : { error_detail: "No headers available on error" },
          typeof errorDataToStore === "object"
            ? JSON.stringify(errorDataToStore)
            : errorDataToStore
        );
        await em.persistAndFlush(errorEntry);
        console.log(
          "[/api/send-request] Saved error event to history, ID:",
          errorEntry.id
        );
      } catch (dbSaveError) {
        console.error(
          "[/api/send-request] Failed to save error event to history:",
          dbSaveError.message
        );
      }
    }

    if (error.isAxiosError && error.response) {
      errorResponseStatus = error.response.status;
      errorResponseJson = {
        error: "External API Error",
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
      };
    } else if (error.isAxiosError && error.request) {
      errorResponseJson = {
        error: "No response from external API",
        details: "The target server did not respond.",
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
