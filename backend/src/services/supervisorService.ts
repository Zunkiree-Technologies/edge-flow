import prisma from "../config/db";
import bcrypt from "bcrypt";

export async function createSupervisor(data: {
  name: string;
  email: string;
  password: string;
  departmentId?: number; // make it optional
}) {
  const hashed = await bcrypt.hash(data.password, 10);

  const supervisor = await prisma.supervisor.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashed,
      // Only connect department if departmentId is provided
      department: data.departmentId
        ? { connect: { id: data.departmentId } }
        : undefined,
    },
    include: { department: true },
  });

  return supervisor;
}

export const assignSupervisorToDepartment = async (
  supervisorId: number,
  departmentId: number
) => {
  return await prisma.supervisor.update({
    where: { id: supervisorId },
    data: { department: { connect: { id: departmentId } } },
    include: { department: true },
  });
};

export const getAllSupervisors = async () => {
  return await prisma.supervisor.findMany({
    include: { department: true }, // so we also see assigned department
  });
};
