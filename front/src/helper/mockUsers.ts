export interface User {
  user_ID: string;
  name: string;
  email: string;
  password: string;
  birthDate: string;
  phone: string;
  address: string;
  city: string;
  zip_code: string;
  role: "CLIENTE" | "PROFESIONAL";
  registration_date: string;
  profileImg: string;
}

export const mockUsers: User[] = [
  {
    user_ID: "1a2b3c4d",
    name: "Juan Pérez",
    email: "juanperez@example.com",
    password: "hashedPassword123",
    birthDate: "1990-05-12",
    phone: "+54 911 2345 6789",
    address: "Av. Corrientes 1234",
    city: "Buenos Aires",
    zip_code: "C1043",
    role: "CLIENTE",
    registration_date: "2025-01-10T14:32:00.000Z",
    profileImg: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    user_ID: "2b3c4d5e",
    name: "María López",
    email: "marialopez@example.com",
    password: "hashedPassword456",
    birthDate: "1985-09-21",
    phone: "+54 341 567 8900",
    address: "Calle San Martín 456",
    city: "Rosario",
    zip_code: "2000",
    role: "PROFESIONAL",
    registration_date: "2025-02-05T10:15:00.000Z",
    profileImg: "https://randomuser.me/api/portraits/women/45.jpg",
  },
  {
    user_ID: "3c4d5e6f",
    name: "Carlos Gómez",
    email: "carlosgomez@example.com",
    password: "hashedPassword789",
    birthDate: "1992-03-30",
    phone: "+54 261 987 6543",
    address: "Boulevard Mitre 789",
    city: "Mendoza",
    zip_code: "5500",
    role: "PROFESIONAL",
    registration_date: "2025-02-15T08:50:00.000Z",
    profileImg: "https://randomuser.me/api/portraits/men/60.jpg",
  },
];
