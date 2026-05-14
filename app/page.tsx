"use client";

import { useEffect, useState } from "react";
import { getClient, type Todo } from "@/lib/supabase";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      const { data } = await getClient()
        .from("todos")
        .select("*")
        .order("created_at", { ascending: true });
      if (data) setTodos(data);
      setLoading(false);
    };
    fetchTodos();
  }, []);

  const addTodo = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const { data } = await getClient()
      .from("todos")
      .insert({ text: trimmed, done: false })
      .select()
      .single();
    if (data) setTodos((prev) => [...prev, data]);
    setInput("");
  };

  const toggleTodo = async (id: number, done: boolean) => {
    const { data } = await getClient()
      .from("todos")
      .update({ done: !done })
      .eq("id", id)
      .select()
      .single();
    if (data) setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  const deleteTodo = async (id: number) => {
    await getClient().from("todos").delete().eq("id", id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = async () => {
    const ids = todos.filter((t) => t.done).map((t) => t.id);
    await getClient().from("todos").delete().in("id", ids);
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <main className="min-h-screen flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            やること
          </h1>
          {todos.length > 0 && (
            <p className="mt-1 text-sm text-slate-400">
              残り {remaining} 件 / 全 {todos.length} 件
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="新しいタスクを入力..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent transition text-sm"
          />
          <button
            onClick={addTodo}
            disabled={!input.trim()}
            className="px-5 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-200 text-white rounded-xl font-medium text-sm shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-300">
            <p className="text-sm">読み込み中...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-16 text-slate-300">
            <div className="text-5xl mb-3">✓</div>
            <p className="text-sm">タスクを追加してはじめましょう</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-white shadow-sm border transition-all ${
                  todo.done ? "border-slate-100 opacity-50" : "border-slate-100"
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id, todo.done)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    todo.done
                      ? "bg-red-400 border-red-400"
                      : "border-slate-300 hover:border-red-300"
                  }`}
                  aria-label={todo.done ? "未完了に戻す" : "完了にする"}
                >
                  {todo.done && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>

                <span
                  className={`flex-1 text-sm ${
                    todo.done ? "line-through text-slate-400" : "text-slate-700"
                  }`}
                >
                  {todo.text}
                </span>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-slate-300 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-50"
                  aria-label="削除"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {todos.some((t) => t.done) && (
          <button
            onClick={clearCompleted}
            className="mt-4 w-full py-2 text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            完了済みをすべて削除
          </button>
        )}
      </div>
    </main>
  );
}
