"use client"; 
import React, { useState } from "react";
import Link from "next/link";

export default function NovaTarefa() {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    prioridade: "",
    prazo: "",
    status: "pendente"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.titulo.trim()) {
      setError("Título obrigatório");
      return;
    }

    if (!formData.prioridade) {
      setError("Prioridade obrigatória");
      return;
    }

    if (!formData.prazo) {
      setError("Prazo obrigatório");
      return;
    }

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    const dataHoje = `${ano}-${mes}-${dia}`;

    if (formData.prazo <  dataHoje) {
      setError("O prazo não pode ser anterior ao dia atual");
      return;
    }

  setSuccess("Tarefa criada com sucesso!");
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <h1 className="text-2xl font-bold text-gray-900">
            To Do List
          </h1>

          <Link
            href="/tarefas"
            className="rounded-lg px-5 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            Voltar
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-8 py-12">
        <div className="rounded-2xl bg-white p-10 shadow-sm">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              Nova tarefa
            </h2>

            <p className="mt-3 text-gray-500">
              Preencha os dados abaixo para criar uma nova tarefa.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}
            <div>
              <label
                htmlFor="titulo"
                className="mb-3 block text-sm font-semibold text-gray-700"
              >
                Título
              </label>

              <input
                id="titulo"
                type="text"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Digite o título da tarefa"
                className="w-full rounded-lg border border-gray-300 px-5 py-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label
                htmlFor="descricao"
                className="mb-3 block text-sm font-semibold text-gray-700"
              >
                Descrição
              </label>

              <textarea
                id="descricao"
                rows={6}
                value={formData.descricao}
                onChange={handleChange}
                placeholder="Descreva a tarefa..."
                className="w-full resize-none rounded-lg border border-gray-300 px-5 py-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <label
                  htmlFor="prioridade"
                  className="mb-3 block text-sm font-semibold text-gray-700"
                >
                  Prioridade
                </label>

                <select
                  id="prioridade"
                  value={formData.prioridade}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-5 py-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="" disabled>
                    Selecione a prioridade
                  </option>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="prazo"
                  className="mb-3 block text-sm font-semibold text-gray-700"
                >
                  Prazo
                </label>

                <input
                  id="prazo"
                  type="date"
                  value={formData.prazo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-5 py-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-3 block text-sm font-semibold text-gray-700"
              >
                Status
              </label>

              <select
                id="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-5 py-4 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluida">Concluída</option>
              </select>
            </div>

            <div className="flex justify-end gap-4 border-t border-gray-200 pt-8">
              <Link
                href="/tarefas"
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </Link>

              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Criar tarefa
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
