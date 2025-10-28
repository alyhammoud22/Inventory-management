import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllUnits = async (req: Request, res: Response) => {
  try {
    const units = await prisma.productUnit.findMany();
    res.json(units);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch units" });
  }
};

export const createUnit = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const newUnit = await prisma.productUnit.create({ data: { name } });
    res.status(201).json(newUnit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create unit" });
  }
};
