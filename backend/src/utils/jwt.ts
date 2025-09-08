import jwt from "jsonwebtoken";

export const generateToken = (
  userId: number,
  role: "ADMIN" | "SUPERVISOR",
  departmentId?: number
) => {
  return jwt.sign({ userId, role, departmentId }, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: number;
    role: "ADMIN" | "SUPERVISOR";
    departmentId?: number;
  };
};
