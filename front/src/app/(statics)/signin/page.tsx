import LoginForm from "./components/login-form";
import ContactAd from "./components/contact-ad";

export default function SignInPage() {
  return (
    <main className="flex flex-col md:flex-row items-start justify-around gap-10 p-8 bg-white">
      <div className="w-full md:w-1/3">
        <ContactAd />
      </div>

      <div className="w-full md:w-1/3">
        <LoginForm />
      </div>
    </main>
  );
}
