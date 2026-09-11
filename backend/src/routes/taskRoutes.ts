import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// GETTERS:
router.get("/", async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ message: "ID do usuário inválido." });
        }

        const tasks = await prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// GETTER: buscar uma tarefa pelo ID
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "ID da tarefa inválido." });
        }

        const task = await prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            return res.status(404).json({ message: "Tarefa não encontrada." });
        }

        return res.status(200).json(task);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// POSTS:
router.post("/", async (req: Request, res: Response) => {
    try {
        const { title, description, status, priority, dueDate, userId } = req.body;

        if (!title || !userId) {
            return res.status(400).json({ message: "Título e ID do usuário são obrigatórios." });
        }

        const task = await prisma.task.create({
            data: {
                title,
                description: description || "",
                status: status || "PENDING",
                priority: priority || "MEDIUM",
                dueDate: dueDate ? new Date(dueDate) : new Date(),
                userId,
            },
        });

        return res.status(201).json(task);

    } catch (error) {
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// PUTS:
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate } = req.body;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "ID da tarefa inválido." });
        }

        const updatedTask = await prisma.task.update({
            where: { id: id as string },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(status && { status }),
                ...(priority && { priority }),
                ...(dueDate && { dueDate: new Date(dueDate) }),
            }
        });
        return res.status(200).json(updatedTask);
    } catch (error) {
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
});

// DELETE:
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "ID da tarefa inválido." });
        }

        await prisma.task.delete({ where: { id: id as string } });
        return res.status(200).json({ message: "Tarefa deletada com sucesso." });
    } catch (error) {
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
});

export default router;