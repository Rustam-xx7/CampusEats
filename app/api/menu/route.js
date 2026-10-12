import { NextResponse } from "next/server";
import {
  getMenuFromFirebase,
  saveMenuItemInFirebase,
  updateMenuItemStockInFirebase,
  seedMenuToFirebase
} from "@/server/menu";

export async function GET() {
  try {
    const menu = await getMenuFromFirebase();
    return NextResponse.json({ success: true, data: menu });
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
    if (body.action === "seed") {
      await seedMenuToFirebase();
      return NextResponse.json({ success: true, message: "Menu seeded to Firebase" });
    }
    const saved = await saveMenuItemInFirebase(body);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    const updated = await updateMenuItemStockInFirebase(body.id, body.isAvailable);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
