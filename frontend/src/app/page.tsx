"use client"; 
import React, { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

 const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.email.includes("@")) {
      setError("E-mail inválido");
      return;
    }

    if (!formData.password) {
      setError("Senha obrigatória");
      return;
    }

    setSuccess("Login realizado com sucesso!");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            To Do List
          </h1>

          <p className="mt-2 text-gray-500">
            Entre na sua conta para acessar suas tarefas
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
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              E-mail
            </label>

            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder="seu@email.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Senha
            </label>

            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Ainda não possui uma conta?{" "}
          <Link
            href="/cadastro"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </main>
  );
}
