import { NextResponse } from "next/server";
import { createMonthlyOrders } from "@/app/api/cron/monthly-orders/route";
import { processMonthlyInvoices } from "@/app/actions/cron/monthly-invoice";

export async function GET() {
  try {
    // First create new orders for subscriptions
    const orderResults = await createMonthlyOrders();
    
    // Then process invoices for any orders that need them
    const invoiceResults = await processMonthlyInvoices();

    return NextResponse.json({
      success: true,
      message: "Test run completed",
      results: {
        orders: orderResults,
        invoices: invoiceResults,
      },
    });
  } catch (error) {
    console.error("Test run error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Test run failed",
    }, { status: 500 });
  }
} 