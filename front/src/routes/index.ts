// export const routes = {
//   home: "/",
//   signin: "/signin",
//   availability: "/availability",
//   register: "/register",
//   profesionales: "/professionals",
//   profile: "/profile",
//   profile_information: "/profile/information",
//   profile_account_edit: "/profile/accountEdit",
//   profesionalDetail: (id: string) => `/professionalDetail/${id}`,
//   como_funciona: "/como-funciona",
//   ayuda: "/ayuda",
//   contacto: "/contact",
//   servicios: "/services",
//   onboarding: "/onboarding",

//   admin: "/admin",
//   admin_categories: "/admin/categories",
//   admin_professionals: "/admin/professionals",
//   admin_users: "/admin/users",
//   admin_dashboard: "/admin/dashboard",

//   plan: "/plan",
// };
export const routes = {
  // Públicas / generales
  home: "/",
  signin: "/signin",
  register: "/register",
  profesionales: "/professionals",
  profesionalDetail: (id: string) => `/professionalDetail/${id}`,
  como_funciona: "/como-funciona",
  faq: "/faq",
  ayuda: "/ayuda",
  contacto: "/contact",
  plan: "/plan",
  onboarding: "/onboarding",

  // Perfil de usuario (cliente)
  profile: "/profile",
  profile_information: "/profile/information",
  profile_account_edit: "/profile/accountEdit",

  // Admin
  admin: "/admin",
  admin_dashboard: "/admin/dashboard",
  admin_categories: "/admin/categories",
  admin_professionals: "/admin/professionals",
  admin_users: "/admin/users",
  admin_dashboard: "/admin/dashboard",
  chats: "/chats",
  plan: "/plan",
};
