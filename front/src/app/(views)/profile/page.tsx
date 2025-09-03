import { ProfileSummary } from "@/components/profileView/profileSummary";

import { mockUsers } from "@/helper/mockUsers";

export default function Profile() {
  return <ProfileSummary user={mockUsers[2]} />;
}
