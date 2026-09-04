"use client";

import { useState } from "react";
import Link from "next/link";

const tarefas = [
  {
    id: 1,
    titulo: "Estudar Next.js",
    descricao: "Aprender os conceitos básicos de Next.js e React.",
    prioridade: "Alta",
    prazo: "31/08/2026",
    status: "Pendente",
  },
  {
    id: 2,
    titulo: "Fazer trabalho de redes",
    descricao: "Configurar as máquinas virtuais do projeto.",
    prioridade: "Média",
    prazo: "02/09/2026",
    status: "Pendente",
  },
  {
    id: 3,
    titulo: "Entregar projeto",
    descricao: "Finalizar e entregar o projeto da disciplina.",
    prioridade: "Baixa",
    prazo: "05/09/2026",
    status: "Concluída",
  },
];

export default function Tarefas() {
  const [tarefaParaExcluir, setTarefaParaExcluir] = useState<number | null>(null);
  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            To Do List
          </h1>

          <button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
            Sair
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Minhas tarefas
            </h2>

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

        <div className="space-y-4">
          {tarefas.map((tarefa) => (
            <div
              key={tarefa.id}
              className="rounded-xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {tarefa.titulo}
                  </h3>

                  <p className="mt-2 text-gray-600">
                    {tarefa.descricao}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    tarefa.prioridade === "Alta"
                      ? "bg-red-100 text-red-700"
                      : tarefa.prioridade === "Média"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {tarefa.prioridade}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm text-gray-500">
                  <span>Prazo: {tarefa.prazo}</span>

                  <span className="ml-4">
                    Status: {tarefa.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {tarefa.status !== "Concluída" && (
                    <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
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
      </div>
      {tarefaParaExcluir !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">
              Excluir tarefa?
            </h2>

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
                onClick={() => {
                  //console para testar se deleta somente a tarefa que foi clicada
                  console.log("Excluir tarefa:", tarefaParaExcluir);
         
                  setTarefaParaExcluir(null)}}
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
