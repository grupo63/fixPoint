import { routes } from "@/routes";

interface INavLinkItem {
  href: string;
  label: string;
}

export const navLinks: INavLinkItem[] = [
  {
    href: routes.home,
    label: "Inicio",
  },
  {
    href: routes.profesionales,
    label: "Profesionales",
  },
  {
    href: routes.como_funciona,
    label: "Cómo funciona",
  },
  {
    href: routes.ayuda,
    label: "Ayuda",
  },
    {
    href: routes.servicios,
    label: "Servicios",
  },
];
