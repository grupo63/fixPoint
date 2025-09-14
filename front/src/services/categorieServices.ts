import { apiUrl } from "@/lib/apiUrl";

export default async function fetchCategories() {
  const res = await fetch(apiUrl("categories"));
  const data = await res.json();
  console.log(data);
  return data;
}
