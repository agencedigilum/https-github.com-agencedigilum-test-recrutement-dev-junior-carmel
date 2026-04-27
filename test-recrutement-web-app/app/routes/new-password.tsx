import { useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router";
import { useNewPassword } from "~/hooks/auth/useNewPassword";
import { showToast } from "~/lib/toast";
import type { Route } from "./+types/new-password";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DigiLum - Nouveau mot de passe" },
    { name: "description", content: "Nouveau mot de passe" },
  ];
}

export default function NewPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const newPassword = useNewPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      showToast("error", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await newPassword.mutateAsync({ token, new_password: password });
      setMessage("Mot de passe mis à jour.");
      showToast("success", "Mot de passe mis à jour avec succès.");
      setTimeout(() => {
        window.location.href = '/'
      }, 2000);
    } catch {
      setError("Impossible de modifier le mot de passe.");
      showToast("error", "Échec de la mise à jour du mot de passe.");
    }
  };

  return (
    <main className="page">
      <section className="card space-y-6">
      <div className="flex items-center justify-center">
      <a href="/"><img src="/logo.png" alt="DigiLum" className="w-40 h-10" /></a>
        </div>
        <h1 className="text-2xl font-bold text-center">Nouveau mot de passe</h1>
        <form className="stack space-y-4" onSubmit={onSubmit}>
          <label htmlFor="new-password-input">Nouveau mot de passe</label>
          <input
            id="new-password-input"
            required
            type="password"
            placeholder="Nouveau mot de passe"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <label htmlFor="confirm-password-input">Confirmer le mot de passe</label>
          <input
            id="confirm-password-input"
            required
            type="password"
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <button type="submit" disabled={newPassword.isPending}>
            {newPassword.isPending ? "Mise à jour..." : "Valider"}
          </button>
        </form>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </section>
    </main>
  );
}
