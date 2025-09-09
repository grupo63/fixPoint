// export const routes = {
//   home: "/",
//   landing: "/landing",
//   signin: "/signin",
//   register: "/register",
//   profesionales: "/profesionales",
//   profesional_detail: "/profesionales/[id]",
//   como_funciona: "/como-funciona",
//   ayuda: "/ayuda",
// };

// // src/routes/index.ts
// export const routes = {
//   // Público
//   home: "/",
//   signin: "/signIn",                 // 👈 lowercase
//   register: "/register",
//   profesionales: "/profesionales",
//   profesionalDetail: (id: string) => `/profesionales/${id}`, // 👈 función para dinámicas
//   como_funciona: "/como-funciona",
//   ayuda: "/ayuda",

//   // Admin
//   admin: "/admin",
//   admin_categories: "/admin/categories",
//   admin_professionals: "/admin/professionals",
//   admin_users: "/admin/users",
//  }


export const routes = {

  home: "/",
  signin: "/signin",
  register: "/register",
  profesionales: "/professionals",
  profile: "/profile",
  profesionalDetail: (id: string) => `/professionalDetail/${id}`,
  como_funciona: "/como-funciona",
  ayuda: "/ayuda",
  contacto: "/contact", 


  admin: "/admin",
  admin_categories: "/admin/categories",
  admin_professionals: "/admin/professionals",
  admin_users: "/admin/users",
};
