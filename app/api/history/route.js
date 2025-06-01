import { NextResponse } from "next/server";
import { getEM } from "../../../lib/db";
import { RequestHistory } from "../../../lib/entities/RequestHistory.entity.js"; // Adjust path if necessary

export async function GET(request) {
  console.log(
    "[/api/history] Received GET request. Attempting to get EntityManager..."
  );
  let em;
  try {
    em = await getEM(); // This might throw if DB initialization fails
    console.log("[/api/history] EntityManager obtained successfully.");
  } catch (dbError) {
    console.error(
      "!!! [/api/history] CRITICAL: Failed to obtain EntityManager !!!"
    );
    console.error("Database Initialization/Connection Error:", dbError.message);
    // Check if the error message indicates a specific DB service unavailability from our db.js
    if (
      dbError.message.toLowerCase().includes("database service") ||
      dbError.message.toLowerCase().includes("orm instance is not available")
    ) {
      return NextResponse.json(
        {
          error: "Database service unavailable",
          details:
            "The database is currently initializing or not reachable. Please try again shortly.",
        },
        { status: 503 } // Service Unavailable
      );
    }
    // Generic fallback for other EntityManager errors
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: "Could not connect to database service.",
      },
      { status: 500 }
    );
  }

  // If em was obtained successfully, proceed to fetch history
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10); // Default to 10 items per page

    if (isNaN(page) || page < 1) {
      console.warn(
        "[/api/history] Invalid page number received:",
        searchParams.get("page")
      );
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      // Max limit of 100 for sanity
      console.warn(
        "[/api/history] Invalid limit value received:",
        searchParams.get("limit")
      );
      return NextResponse.json(
        { error: "Invalid limit value (must be 1-100)" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    console.log(
      `[/api/history] Fetching history: page=${page}, limit=${limit}, offset=${offset}`
    );
    const [historyItems, totalItems] = await em.findAndCount(
      RequestHistory,
      {}, // No specific conditions, fetch all (respecting pagination)
      {
        orderBy: { createdAt: "DESC" }, // Show newest first
        limit: limit,
        offset: offset,
      }
    );
    console.log(
      `[/api/history] Found ${totalItems} total items, returning ${historyItems.length} for this page.`
    );

    return NextResponse.json({
      data: historyItems,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    });
  } catch (error) {
    // Catch errors related to history fetching logic AFTER EM is obtained
    console.error(
      "!!! [/api/history] Error fetching history data after obtaining EM !!!"
    );
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
    // Check if it's an error from MikroORM itself, e.g., table not found (though updateSchema should prevent this)
    if (error.name && error.name.includes("MikroORM")) {
      return NextResponse.json(
        { error: "Database query error", details: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: "Failed to fetch history",
        details: "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
