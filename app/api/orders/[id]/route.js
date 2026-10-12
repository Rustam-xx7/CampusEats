import { NextResponse } from "next/server";
import { getOrderByIdFromFirebase, updateOrderStatusInFirebase } from "@/server/orders";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = await getOrderByIdFromFirebase(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateOrderStatusInFirebase(id, body.status);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
