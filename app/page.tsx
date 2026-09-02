"use client"

import { useState, useEffect } from "react"

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
      setError(data.error)
      return
    }

    setExpenses(expenses.filter((expense) => expense._id !== id))
  }

    const editExpense = (id: string) => {
      const expense = expenses.find((expense) => expense._id ===id)

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
        setError(data.error)
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
      setError("Title is required")
      return
    }

    if (amount.trim() === "") {
      setError("Amount is required")
      return
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    if (category.trim() === "") {
      setError("Category is required")
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
      setError(data.error)
      return
    }

    setExpenses([...expenses, data])

    setTitle("")
    setAmount("")
    setCategory("")
  }

  return (
    <main>
      <h1>spendster</h1>
      <p>Total Expenses: ₹{total}</p>
      <form onSubmit={addExpense}>
        <input type="text" placeholder="Expense title" value={title} onChange={(e) => { setTitle(e.target.value) }} />
        <input type="number" placeholder="Amount" value={amount} onChange={(e) => { setAmount(e.target.value) }} />
        <input type="text" placeholder="Category" value={category} onChange={(e) => { setCategory(e.target.value) }} />
        <button type="submit">{editingId? "Update Expense":"Add Expense"}</button>

      </form>
      <div>
        {
          expenses.map((expense) => (
            <div key={expense._id}>
              <h2>{expense.title}</h2>
              <p>₹{expense.amount}</p>
              <p>{expense.category}</p>
              <p>{expense.createdAt}</p>
              <button onClick={() => editExpense(expense._id)}>
                Edit
              </button>
              <button onClick={() => deleteExpense(expense._id)}>Delete expense</button>
            </div>
          ))
        }
      </div>
      {error && <p>{error}</p>}
    </main >
  )
}