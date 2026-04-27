import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Check, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { clearSession, getAccessToken, getStoredUser } from "~/lib/auth-storage";
import { useCreateTask } from "~/hooks/tasks/useCreateTask";
import { useDeleteTask } from "~/hooks/tasks/useDeleteTask";
import { useTasks } from "~/hooks/tasks/useTasks";
import { useUpdateTask } from "~/hooks/tasks/useUpdateTask";
import type { Route } from "./+types/dashboard";
import { Link, useNavigate } from "react-router";
import { showToast } from "~/lib/toast";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "DigiLum - Dashboard" },
    { name: "description", content: "Dashboard des tâches" },
  ];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isDone, setIsDone] = useState("");
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (!getAccessToken()) {
      navigate("/");
    }
  }, [navigate]);

  const query = useMemo(
    () => ({ page, limit, search, is_done: isDone, sort, order }),
    [page, limit, search, isDone, sort, order],
  );
  const tasks = useTasks(query);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const onCreateTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await createTask.mutateAsync({
        title,
        description: description || undefined,
        due_date: dueDate || undefined,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setCreateOpen(false);
      showToast("success", "Tâche créée avec succès.");
    } catch {
      showToast("error", "Échec de la création de la tâche.");
    }
  };

  const onDeleteTask = async (id: string) => {
    const accepted = window.confirm("Confirmer la suppression de cette tâche ?");
    if (accepted) {
      await deleteTask.mutateAsync(id);
      showToast("success", "Tâche supprimée avec succès.");
    }
  };

  const onUpdateTask = async (id: string, is_done: boolean) => {
    try {
      await updateTask.mutateAsync({ id, data: { is_done: !is_done } });
      showToast("success", "Statut de la tâche mis à jour.");
    } catch {
      showToast("error", "Échec de la modification de la tâche.");
    }
  };

  return (
    <main className="page">
      <section className="card wide">
        <header className="header">
          <div>
            <div className="flex ">
              <img src="/logo.png" alt="DigiLum" className="w-40 h-10" />
            </div>

          </div>
          <div className="header-actions">
            <Link to="/profile" className=" text-gray-500 hover:text-gray-700">Mon profil</Link>
            <button
              type="button"
              className="ghost flex items-center gap-2"
              onClick={() => {
                clearSession();
                navigate("/");
              }}
            >
              <LogOut size={16} /> Déconnexion
            </button>

          </div>
        </header>

        <div className="flex justify-between flex-wrap gap-2 my-10 bg-gray-50 p-4 rounded-md">
          <h1 className="text-lg font-meduim text-center mt-10 w-1/2">
            Bienvenue sur le gestionnaire de tâches de {" "}
            <span className="text-[#f5a623]">DigiLum</span>{" "}
            <span className="">pour {user?.first_name || user?.last_name
              ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
              : user?.email}</span>
          </h1>
          <button type="button" className="ghost flex items-center gap-2 !bg-[#f5a623] !h-max my-auto" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> Ajouter une tâche
          </button>
        </div>

        <form className="filters mt" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label htmlFor="task-search">Recherche</label>
            <input
              id="task-search"
              placeholder="Recherche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="task-limit">Résultats/page</label>
            <select id="task-limit" value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-status">Statut</label>
            <select id="task-status" value={isDone} onChange={(e) => setIsDone(e.target.value)}>
              <option value="">Tous</option>
              <option value="true">Fait</option>
              <option value="false">Non fait</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-sort">Tri</label>
            <select id="task-sort" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="created_at">Date création</option>
              <option value="title">Titre</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-order">Ordre</label>
            <select id="task-order" value={order} onChange={(e) => setOrder(e.target.value as "asc" | "desc")}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
        </form>

        <div className="mt list">
          {tasks.isLoading && <p className="muted">Chargement des tâches...</p>}
          {(tasks.data?.data ?? []).map((task) => (
            <article className="task" key={task.id}>
              <div>
                <h3 className="text-lg font-bold">{task.title} {task.is_done && <span className="text-green-500">✅</span>}</h3>
                <p className="muted">{task.description || "Aucune description"}</p>
              </div>
              <div className="actions">
                {!task.is_done && <button
                  type="button"
                  title="Modifier"
                  onClick={() => {
                    setEditId(task.id);
                    setTitle(task.title);
                    setDescription(task.description || "");
                    setDueDate(task.due_date ? task.due_date.slice(0, 16) : "");
                  }}
                >
                  <Pencil size={16} />
                </button>}
                {!task.is_done && <button
                  type="button"
                  title="Terminer"
                  disabled={updateTask.isPending}
                  onClick={() => {
                    const accepted = window.confirm("Confirmer la fin de cette tâche ?");
                    if (accepted) {
                      onUpdateTask(task.id, task.is_done);
                    }
                  }}
                >
                  <Check size={16} />
                </button>}
                <button
                  type="button"
                  title="Supprimer"
                  className="!bg-red-500"
                  disabled={deleteTask.isPending}
                  onClick={() => {
                    const accepted = window.confirm("Confirmer la suppression de cette tâche ?");
                    if (accepted) {
                      onDeleteTask(task.id);
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>

        {createOpen && (
          <div className="dialog">
            <section className="card space-y-6">
              <h2 className="text-lg font-bold text-center mb-4">Ajouter une tâche</h2>
              <form className="stack" onSubmit={onCreateTask}>
                <label htmlFor="create-title">Titre</label>
                <input
                  id="create-title"
                  required
                  placeholder="Titre"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <label htmlFor="create-description">Description</label>
                <textarea
                  id="create-description"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <label htmlFor="create-due-date">Date d'échéance</label>
                <input
                  id="create-due-date"
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
                <button type="submit" disabled={createTask.isPending}>
                  {createTask.isPending ? "Création..." : "Créer"}
                </button>
              </form>
              <button type="button" className="ghost mt" onClick={() => setCreateOpen(false)}>
                Fermer
              </button>
            </section>
          </div>
        )}

        {editId && (
          <div className="dialog">
            <section className="card space-y-6">
              <h2 className="text-lg font-bold text-center mb-4">Modifier la tâche</h2>
              <form
                className="stack space-y-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  try {
                    await updateTask.mutateAsync({
                      id: editId,
                      data: { title, description, due_date: dueDate || undefined },
                    });
                    setEditId(null);
                    showToast("success", "Tâche modifiée avec succès.");
                  } catch {
                    showToast("error", "Échec de la modification de la tâche.");
                  }
                }}
              >
                <label htmlFor="edit-title">Titre</label>
                <input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <label htmlFor="edit-description">Description</label>
                <textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <label htmlFor="edit-due-date">Date d'échéance</label>
                <input id="edit-due-date" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                <button type="submit" disabled={updateTask.isPending}>
                  {updateTask.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </button>
              </form>
              <button type="button" className="ghost" onClick={() => setEditId(null)}>
                Fermer
              </button>
            </section>
          </div>
        )}

        <div className="pagination mt">
          <button type="button" className="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Précédent
          </button>
          <span>Page {tasks.data?.page ?? page}</span>
          <button type="button" className="ghost" onClick={() => setPage((p) => p + 1)}>
            Suivant
          </button>
        </div>
      </section>
    </main>
  );
}
