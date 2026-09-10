import { Router} from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
//@ts-ignore
import bcrypt from "bcryptjs";

const router = Router();

// POST:
router.post("/register", async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email já está em uso." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return res.status(201).json({ message: "Usuário registrado com sucesso.", user });

    } catch (error) {
        console.error("ERRO:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email e senha são obrigatórios." });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Email ou senha inválidos." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Email ou senha inválidos." });
        }

        return res.status(200).json({ message: "Login realizado com sucesso.",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }, 
        });
    } catch (error) {
        console.error("ERRO:", error);
        return res.status(500).json({ message: "Erro interno no servidor." });
    }
});

export default router;