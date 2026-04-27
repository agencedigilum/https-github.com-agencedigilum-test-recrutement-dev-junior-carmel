import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useChangeMail } from "~/hooks/auth/useChangeMail";
import { useChangePassword } from "~/hooks/auth/useChangePassword";
import { useProfile } from "~/hooks/auth/useProfile";
import { useUpdateProfile } from "~/hooks/auth/useUpdateProfile";
import type { Route } from "./+types/profile";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { showToast } from "~/lib/toast";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "DigiLum - Profil" },
    { name: "description", content: "Profil de l'utilisateur" },
  ];
}

export default function ProfilePage() {
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const changeMail = useChangeMail();
  const changePassword = useChangePassword();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPasswordForMail, setCurrentPasswordForMail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");


  useEffect(() => {
    if (profile.data) {
      setFirstName(profile.data.first_name || "");
      setLastName(profile.data.last_name || "");
    }
  }, [profile.data]);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await updateProfile.mutateAsync({ first_name: firstName, last_name: lastName });
      showToast("success", "Profil mis à jour avec succès.");
    } catch {
      showToast("error", "Échec de la mise à jour du profil.");
    }
  };

  const submitMail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await changeMail.mutateAsync({
        current_password: currentPasswordForMail,
        new_email: newEmail,
      });
      showToast("success", "Email mis à jour avec succès.");
    } catch {
      showToast("error", "Échec de la mise à jour de l'email.");
    }
  };

  const submitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
      });
      showToast("success", "Mot de passe mis à jour avec succès.");
    } catch {
      showToast("error", "Échec de la mise à jour du mot de passe.");
    }
  };

  return (
    <main className="page">
      
      <section className="card wide space-y-3">
      <div className="flex w-max justify-start border border-gray-200 rounded-md p-2">
        <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" /> Retour 
        </Link>
      </div>
        <form className="stack mt space-y-4 mb-10" onSubmit={submitProfile}>
          <h2 className="text-lg font-bold text-center mb-4">Informations générales</h2>
          <label htmlFor="profile-first-name">Prénom</label>
          <input id="profile-first-name" placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <label htmlFor="profile-last-name">Nom</label>
          <input id="profile-last-name" placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </form>

        <form className="stack mt mb-10 space-y-4 " onSubmit={submitMail}>
          <h2 className="text-lg font-bold text-center mb-4">Changer l'email</h2>
          <label htmlFor="profile-current-password-mail">Mot de passe actuel</label>
          <input
            id="profile-current-password-mail"
            type="password"
            placeholder="Mot de passe actuel"
            value={currentPasswordForMail}
            onChange={(e) => setCurrentPasswordForMail(e.target.value)}
          />
          <label htmlFor="profile-new-email">Nouvel email</label>
          <input id="profile-new-email" type="email" placeholder="Nouvel email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <button type="submit" disabled={changeMail.isPending}>
            {changeMail.isPending ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>

        <form className="stack mt space-y-4 mb-10" onSubmit={submitPassword}>
          <h2 className="text-lg font-bold text-center mb-4">Changer le mot de passe</h2>
          <label htmlFor="profile-current-password">Mot de passe actuel</label>
          <input
            id="profile-current-password"
            type="password"
            placeholder="Mot de passe actuel"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <label htmlFor="profile-new-password">Nouveau mot de passe</label>
          <input
            id="profile-new-password"
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? "Mise à jour..." : "Mettre à jour"}
          </button>
        </form>
      </section>
    </main>
  );
}
