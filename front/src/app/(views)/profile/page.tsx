import { ProfileSummary } from "@/components/profileView/profileSummary";
import { UserProfile } from "@/types/types";

const mockUser: UserProfile = {
  user_ID: "1a2b3c4d",
  name: "Juan Pérez",
  email: "juanperez@example.com",
  phone: "+54 911 2345 6789",
  city: "Buenos Aires",
  address: "Av. Corrientes 1234",
  zip_code: "C1043",
  registration_date: "2025-01-10T14:32:00.000Z",
  profileImg: "https://randomuser.me/api/portraits/men/32.jpg",
  role: "CLIENTE",
};

export default function Profile() {
  return <ProfileSummary user={mockUser} />;
}
