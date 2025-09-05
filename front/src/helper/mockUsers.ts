
import type { IUser } from "@/types/types";

export const mockUsers: IUser[] = [
  {
    userId: "3c4d5e6f",
    name: "Carlos Gómez",
    email: "carlosgomez@example.com",
    password: "hashedPassword789",
    birthDate: "1992-03-30",
    phone: "+54 261 987 6543",
    address: "Boulevard Mitre 789",
    city: "Mendoza",
    zipCode: "5500",
    role: "PROFESIONAL",
    registrationDate: "2025-02-15T08:50:00.000Z",
    profileImg: "https://randomuser.me/api/portraits/men/60.jpg",
  },
  {
    userId: "a1b2c3d4",
    name: "María Ruiz",
    email: "maria@example.com",
    password: "hashedPassword123",
    birthDate: "1990-07-12",
    phone: "+54 11 4567-1234",
    address: "Av. Rivadavia 1234",
    city: "CABA",
    zipCode: "1001",
    role: "CLIENTE",
    registrationDate: "2025-01-20T10:30:00.000Z",
    profileImg: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    userId: "z9y8x7w6",
    name: "Admin Uno",
    email: "admin@example.com",
    password: "hashedAdmin000",
    birthDate: "1985-02-05",
    phone: "+54 11 5555-0000",
    address: "Maipú 456",
    city: "CABA",
    zipCode: "1004",
    role: "ADMIN",
    registrationDate: "2025-01-01T09:00:00.000Z",
    profileImg: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    userId: "u4perez",
    name: "Juan Pérez",
    email: "juan@example.com",
    password: "hashedPassword456",
    birthDate: "1993-11-02",
    phone: "+54 351 222-3333",
    address: "Duarte Quirós 2200",
    city: "Córdoba",
    zipCode: "5000",
    role: "PROFESIONAL",
    registrationDate: "2025-05-20T12:10:00.000Z",
    profileImg: "https://randomuser.me/api/portraits/men/22.jpg",
  },
];


export default async function fetchUsers(delayMs = 0): Promise<IUser[]> {
  if (delayMs > 0) {
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return mockUsers.map((u) => ({ ...u }));
}