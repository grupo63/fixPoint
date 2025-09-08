import { apiUrl } from "@/lib/apiUrl";

export default async function fetchProfessionals() {
const res = await fetch(apiUrl("professional"));
const data = await res.json();         
console.log(data)
return data
 }