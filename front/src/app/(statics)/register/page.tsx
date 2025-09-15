import RegisterForm from "./components/register-form";
import ContactAd from "../signin/components/contact-ad";

export default function RegisterPage() {
  return (
    <main className="flex flex-col md:flex-row items-start justify-around gap-10 p-8 bg-white">
      {/* Columna izquierda - Publicidad */}
      <div className="w-full md:w-1/3">
        <ContactAd />
      </div>

      {/* Columna derecha - Formulario */}
      <div className="w-full md:w-1/3">
        <RegisterForm />
      </div>
    </main>
  );
}
