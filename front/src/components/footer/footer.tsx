export default function Footer() {
  return (
    <footer className="bg-white text-gray-800">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Marca */}
        <div>
          <h2 className="text-xl font-bold text-gray-900">FixPoint</h2>
          <p className="mt-3 text-sm text-gray-600">
            El marketplace de oficios más confiable de Argentina. Conectamos
            personas con profesionales verificados.
          </p>
        </div>

        {/* Soporte */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-900">Soporte</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a href="/contacto" className="hover:text-blue-600">
                Contacto
              </a>
            </li>
            <li>
              <a href="/terminos" className="hover:text-blue-600">
                Términos y condiciones
              </a>
            </li>
            <li>
              <a href="/privacidad" className="hover:text-blue-600">
                Política de privacidad
              </a>
            </li>
            <li>
              <a href="/faq" className="hover:text-blue-600">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-gray-900">Contacto</h3>
          <p className="text-sm text-gray-600">info@fixpoint.com.ar</p>
          <p className="text-sm text-gray-600">+54 11 4567-8900</p>
          <div className="flex gap-3 mt-4">
            {/* Aquí van iconos de redes si usás react-icons o lucide-react */}
          </div>
        </div>
      </div>

      {/* Línea inferior */}
      <div className="border-t border-gray-200 py-4 text-center text-gray-500 text-sm">
        © 2025 FixPoint. Todos los derechos reservados.
      </div>
    </footer>
  );
}
