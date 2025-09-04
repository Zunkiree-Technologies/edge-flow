import prisma from "../config/db";

interface DepartmentData {
  name: string;
  supervisor: string;
  remarks?: string;
}

export const createDepartment = async (data: DepartmentData) => {
  const newDept = await prisma.departments.create({
    data,
  });
  return newDept;
};

export const getAllDepartments = async () => {
  return await prisma.departments.findMany({
    include: {
      sub_batches: true,
      workers: true,
      dept_workers: true,
      dept_batches: true,
      rejected: true,
      altered: true,
    },
  });
};

export const getDepartmentById = async (id: number) => {
  const dept = await prisma.departments.findUnique({
    where: { id },
    include: {
      sub_batches: true,
      workers: true,
      dept_workers: true,
      dept_batches: true,
      rejected: true,
      altered: true,
    },
  });
  if (!dept) throw new Error("Department not found");
  return dept;
};

export const updateDepartment = async (
  id: number,
  data: Partial<DepartmentData>
) => {
  const updatedDept = await prisma.departments.update({
    where: { id },
    data,
  });
  return updatedDept;
};

export const deleteDepartment = async (id: number) => {
  return await prisma.departments.delete({
    where: { id },
  });
};
