import { NextResponse } from "next/server";
import { createOrderInFirebase, getOrdersFromFirebase } from "@/server/orders";

export async function GET() {
  try {
    const orders = await getOrdersFromFirebase();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const createdOrder = await createOrderInFirebase(body);
    return NextResponse.json({ success: true, data: createdOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
