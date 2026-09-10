"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: string;
  userId: string;
}

export default function Tarefas() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<string | null>(null);

  const fetchTasks = async () => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserObj = localStorage.getItem("user");

    let userId = storedUserId;

    if (!userId && storedUserObj) {
      try {
        const parsed = JSON.parse(storedUserObj);
        userId = parsed.id || parsed.userId;
      } catch (e) {
        console.error("Erro ao ler user do localStorage", e);
      }
    }

    if (!userId) {
      router.push("/");
      return;
    }

    try {
      const response = await fetch(`/api/tasks?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
  };

  const handleConcluir = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (response.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "COMPLETED" } : t))
        );
      }
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
    }
  };

  const handleExcluir = async () => {
    if (!tarefaParaExcluir) return;

    try {
      const response = await fetch(`/api/tasks/${tarefaParaExcluir}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== tarefaParaExcluir));
      }
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    } finally {
      setTarefaParaExcluir(null);
    }
  };

  const translatePriority = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "Alta";
      case "MEDIUM":
        return "Média";
      case "LOW":
        return "Baixa";
      default:
        return priority;
    }
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">To Do List</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Minhas tarefas</h2>
            <p className="mt-1 text-gray-500">
              Organize suas atividades e acompanhe seu progresso.
            </p>
          </div>

          <Link
            href="/tarefas/nova"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Nova tarefa
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Carregando tarefas...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">Nenhuma tarefa encontrada.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((tarefa) => (
              <div key={tarefa.id} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {tarefa.title}
                    </h3>
                    <p className="mt-2 text-gray-600">{tarefa.description}</p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${
                      tarefa.priority === "HIGH"
                        ? "bg-red-100 text-red-700"
                        : tarefa.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {translatePriority(tarefa.priority)}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    <span>
                      Prazo: {new Date(tarefa.dueDate).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="ml-4">
                      Status: {tarefa.status === "COMPLETED" ? "Concluída" : "Pendente"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {tarefa.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleConcluir(tarefa.id)}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Concluir
                      </button>
                    )}

                    <Link
                      href={`/tarefas/editar/${tarefa.id}`}
                      className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
                    >
                      Editar
                    </Link>

                    <button
                      onClick={() => setTarefaParaExcluir(tarefa.id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {tarefaParaExcluir && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Excluir tarefa?</h2>
            <p className="mt-3 text-gray-600">
              Tem certeza que deseja excluir esta tarefa?
            </p>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setTarefaParaExcluir(null)}
                className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>

              <button
                onClick={handleExcluir}
                className="rounded-lg bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}