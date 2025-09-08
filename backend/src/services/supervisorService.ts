import prisma from "../config/db";
import bcrypt from "bcrypt";

export async function createSupervisor(data: {
  name: string;
  email: string;
  password: string;
  departmentId: number;
}) {
  const hashed = await bcrypt.hash(data.password, 10);

  const supervisor = await prisma.supervisor.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      departmentId: data.departmentId,
    },
    include: { department: true },
  });

  return supervisor;
}
