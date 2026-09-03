import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import connectDB from "@/app/lib/mongodb";
import Expense from "@/app/models/Expense";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

  const expenses = await Expense.find({
  userId: session.user.email,
}).sort({ createdAt: -1 });

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();

    const { title, amount, category } = body;

    if (typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    if (typeof category !== "string" || category.trim() === "") {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      userId: session.user.email,
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}