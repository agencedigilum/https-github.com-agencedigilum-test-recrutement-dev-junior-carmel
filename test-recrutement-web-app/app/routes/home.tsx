import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import type { Route } from "./+types/home";
import { useVerifyMail } from "~/hooks/auth/useVerifyMail";
import { useSignIn } from "~/hooks/auth/useSignIn";
import { useSignUp } from "~/hooks/auth/useSignUp";
import { getAccessToken, saveSession } from "~/lib/auth-storage";
import { showToast } from "~/lib/toast";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "DigiLum - Connexion" },
    { name: "description", content: "Connexion et inscription" },
  ];
}

export default function Home() {
  const navigate = useNavigate();
  const verifyMail = useVerifyMail();
  const signIn = useSignIn();
  const signUp = useSignUp();

  const [step, setStep] = useState<"email" | "auth">("email");
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (getAccessToken()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleVerifyMail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await verifyMail.mutateAsync(email);
      if (response.exists && !response.is_active) {
        setMessage("Compte inactif. Vérifie ta boîte email pour confirmer ton compte.");
        showToast("error", "Compte inactif. Vérifie ton email de confirmation.");
        return;
      }
      setMode(response.exists ? "signin" : "signup");
      setStep("auth");
      showToast("success", "Email vérifié avec succès.");
    } catch {
      setError("Impossible de vérifier cet email.");
      showToast("error", "Échec de la vérification de l'email.");
    }
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    setError("");
    try {
      if (mode === "signin") {
        const data = await signIn.mutateAsync({ email, password });
        saveSession(data);
        showToast("success", "Connexion réussie.");
        navigate("/dashboard");
      } else {
        const data = await signUp.mutateAsync({
          email,
          password,
          first_name: title || undefined,
        });
        saveSession(data);
        showToast("success", "Compte créé avec succès.");
        navigate("/dashboard");
      }
    } catch {
      setError("Échec de l'authentification.");
      showToast("error", "Échec de l'authentification.");
    }
  };

  return (
    <main className="page">
      <motion.section className="card auth-card space-y-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="DigiLum" className="w-40 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-center">Connexion / Inscription</h1>
        <p className="muted">Entrez votre email pour continuer.</p>

        <form onSubmit={handleVerifyMail} className="stack space-y-4">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          {step === "email" && (
            <button type="submit" disabled={verifyMail.isPending}>
              {verifyMail.isPending ? "Vérification..." : "Continuer"}
            </button>
          )}
        </form>

        {step === "auth" && (
          <motion.form className="stack mt" onSubmit={handleAuth} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {mode === "signup" && (
              <>
                <label htmlFor="first-name">Prénom (optionnel)</label>
                <input
                  id="first-name"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Prénom (optionnel)"
                />
              </>
            )}
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mot de passe"
              type="password"
              required
            />
            <button type="submit" disabled={signIn.isPending || signUp.isPending}>
              {signIn.isPending || signUp.isPending
                ? "Chargement..."
                : mode === "signin"
                  ? "Se connecter"
                  : "Créer mon compte"}
            </button>
          </motion.form>
        )}

        <div className="row">
          <a href="/forget-password">Mot de passe oublié ?</a>
        </div>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </motion.section>
    </main>
  );
}
