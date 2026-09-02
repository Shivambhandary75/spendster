import { NextResponse } from "next/server";
import connectDB from "@/app/lib/mongodb";
import Expense from "@/app/models/Expense";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    const { title, amount, category } = body;

   if (
  typeof title !== "string" ||
  title.trim() === ""
) {
  return NextResponse.json(
    { error: "Title is required" },
    { status: 400 }
  )
}

if (
  typeof amount !== "number" ||
  amount <= 0
) {
  return NextResponse.json(
    { error: "Amount must be greater than 0" },
    { status: 400 }
  )
}

if (
  typeof category !== "string" ||
  category.trim() === ""
) {
  return NextResponse.json(
    { error: "Category is required" },
    { status: 400 }
  )
}

    const expense = await Expense.findByIdAndUpdate(
      id,
      { title, amount, category },
      { new: true }
    );

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update expense" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return NextResponse.json(
        { error: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete expense" },
      { status: 500 }
    );
  }
}