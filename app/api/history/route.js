import { NextResponse } from "next/server";
import { getEM } from "../../../lib/db";
import { RequestHistory } from "../../../lib/entities/RequestHistory.entity.js";

export async function GET(request) {
  const em = await getEM();
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Invalid page number" },
        { status: 400 }
      );
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid limit value" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;
    const [historyItems, totalItems] = await em.findAndCount(
      RequestHistory,
      {},
      {
        orderBy: { createdAt: "DESC" },
        limit: limit,
        offset: offset,
      }
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
    console.error("Error in /api/history:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to fetch history", details: error.message },
      { status: 500 }
    );
  }
}
