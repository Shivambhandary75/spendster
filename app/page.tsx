"use client"

import { useState, useEffect, useRef } from "react"

type Expense = {
  _id: string
  title: string
  amount: number
  category: string
  createdAt: string
}

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const dialogRef=useRef<HTMLDialogElement>(null)
  const showError = (message: string) => {
    setError(message)
    dialogRef.current?.showModal()
  }
  useEffect(() => {
    const fetchExpenses = async () => {
      const response = await fetch("/api/expenses")
      const data = await response.json()
      setExpenses(data)
    }

    fetchExpenses()
  }, [])
  const deleteExpense = async (id: string) => {
    const response = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
    })

    const data = await response.json()

    if (!response.ok) {
      showError(data.error)
      return
    }

    setExpenses(expenses.filter((expense) => expense._id !== id))
  }

  const editExpense = (id: string) => {
    const expense = expenses.find((expense) => expense._id === id)

    if (!expense) return

    setTitle(expense.title)
    setAmount(expense.amount.toString())
    setCategory(expense.category)
    setEditingId(id)
  }

  const addExpense = async (e: React.FormEvent<HTMLFormElement>) => {

    e.preventDefault()
    setError("")
    if (editingId != null) {
      const response = await fetch(`/api/expenses/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          category,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showError(data.error)
        return
      }

      setExpenses(
        expenses.map((expense) =>
          expense._id === editingId ? data : expense
        )
      )

      setEditingId(null)
      setTitle("")
      setAmount("")
      setCategory("")

      return
    }
    if (title.trim() === "") {
      showError("Title is required")
      return
    }

    if (amount.trim() === "") {
      showError("Amount is required")
      return
    }

    if (Number(amount) <= 0) {
      showError("Amount must be greater than 0")
      return
    }

    if (category.trim() === "") {
      showError("Category is required")
      return
    }
    if (editingId != null) {
      return
    }

    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        amount: Number(amount),
        category,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      showError(data.error)
      return
    }

    setExpenses([...expenses, data])

    setTitle("")
    setAmount("")
    setCategory("")
  }

  return (
  <main className="min-h-screen bg-white text-black">
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

      <header className="mb-10 border-b border-black pb-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          spendster
        </h1>

        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          An Expense Tracker
        </p>
      </header>


      <section className="mb-8 rounded-2xl border border-black bg-black p-6 text-white sm:p-8">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-300">
          Total Expenses
        </p>

        <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
          ₹{total}
        </h2>
      </section>


      <section className="mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-7">

        <h2 className="mb-6 text-2xl font-bold">
          {editingId ? "Edit Expense" : "Add Expense"}
        </h2>

        <form onSubmit={addExpense} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium">
              Expense Title
            </label>

            <input
              type="text"
              placeholder="e.g. Lunch"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-black"
            />
          </div>


          <div>
            <label className="mb-2 block text-sm font-medium">
              Amount
            </label>

            <input
              type="number"
              placeholder="e.g. 500"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-black"
            />
          </div>



          <div>
            <label className="mb-2 block text-sm font-medium">
              Category
            </label>

            <input
              type="text"
              placeholder="e.g. Food"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
              }}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black outline-none transition focus:border-black"
            />
          </div>


         <button
  type="submit"
  className={`w-full rounded-lg px-5 py-3 font-medium text-white transition active:scale-[0.99] ${
    editingId
      ? "bg-blue-500 hover:bg-blue-600"
      : "bg-green-500 hover:bg-green-600"
  }`}
>
  {editingId ? "Update Expense" : "Add Expense"}
</button>

        </form>
      </section>


      <section className="mb-10">

        <div className="mb-5 flex items-center justify-between border-b border-black pb-3">
          <h2 className="text-2xl font-bold">
            Your Expenses
          </h2>

          <p className="text-sm text-gray-500">
            {expenses.length} expenses
          </p>
        </div>


        <div className="space-y-4">

          {
            expenses.map((expense) => (
              <div
                key={expense._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-black sm:p-6"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <h2 className="text-xl font-bold">
                      {expense.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {expense.category}
                    </p>
                  </div>

                  <p className="text-2xl font-bold">
                    ₹{expense.amount}
                  </p>

                </div>


                <p className="mt-4 text-sm text-gray-400">
                  {expense.createdAt}
                </p>


                <div className="mt-5 flex flex-col gap-2 sm:flex-row">

                  <button
                    onClick={() => editExpense(expense._id)}
                    className="rounded-lg border border-black px-5 py-2.5 text-sm font-medium transition hover:bg-black hover:text-white"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteExpense(expense._id)}
                    className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
                  >
                    Delete expense
                  </button>

                </div>

              </div>
            ))
          }

        </div>
      </section>


     <dialog
  ref={dialogRef}
  className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black p-0 backdrop:bg-black/50"
>
  <div className="p-6">

    <h2 className="text-xl font-bold text-red-500">
      Warning!!!
    </h2>

    <p className="mt-3 text-gray-600 text-red-500">
      {error}
    </p>

    <button
      onClick={() => dialogRef.current?.close()}
      className="mt-6 w-full rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
    >
      Close
    </button>

  </div>
</dialog>

    </div>
  </main>
)
}