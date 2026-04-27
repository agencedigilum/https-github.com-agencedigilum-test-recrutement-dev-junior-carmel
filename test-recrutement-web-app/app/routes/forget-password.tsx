import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";
import { useForgetPassword } from "~/hooks/auth/useForgetPassword";
import { showToast } from "~/lib/toast";
import type { Route } from "./+types/forget-password";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "DigiLum - Mot de passe oublié" },
    { name: "description", content: "Mot de passe oublié" },
  ];
}

export default function ForgetPasswordPage() {
  const forgetPassword = useForgetPassword();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await forgetPassword.mutateAsync(email);
      setMessage("Si le compte existe, un email de réinitialisation a été envoyé.");
      showToast("success", "Demande envoyée avec succès.");
    } catch {
      showToast("error", "Échec de l'envoi de la demande.");
    }
  };

  return (
    <main className="page">
      <section className="card space-y-6">
        <div className="flex items-center justify-center">
          <Link to="/"><img src="/logo.png" alt="DigiLum" className="w-40 h-10" /></Link>
        </div>
        <h1 className="text-2xl font-bold text-center">Mot de passe oublié</h1>
        <form className="stack space-y-4" onSubmit={onSubmit}>
          <label htmlFor="forget-email">Email</label>
          <input
            id="forget-email"
            required
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" disabled={forgetPassword.isPending}>
            {forgetPassword.isPending ? "Envoi..." : "Envoyer"}
          </button>
        </form>

        <div className="row">
          <a href="/forget-password">Mot de passe oublié ?</a>
        </div>

        {message && <p className="success">{message}</p>}
      </section>
    </main>
  );
}
