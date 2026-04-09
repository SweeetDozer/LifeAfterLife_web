import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCreatePersonMutation, usePersonsByTreeQuery } from "../entities/person/model/use-person-queries";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/client";
import { Field } from "../shared/ui/Field";
import { PageSection } from "../shared/ui/PageSection";
import { Panel } from "../shared/ui/Panel";
import {
  useDeleteTreeMutation,
  useGrantTreeAccessMutation,
  useRevokeTreeAccessMutation,
  useTreeAccessQuery,
  useTreesQuery,
  useUpdateTreeAccessMutation,
  useUpdateTreeMutation
} from "../entities/tree/model/use-tree-queries";
import type { PersonCreate, TreeAccessGrantRequest, TreeRead, TreeUpdate } from "../shared/types/api";

function createEmptyPerson(treeId: number): PersonCreate {
  return {
    first_name: "",
    middle_name: "",
    last_name: "",
    birth_date: "",
    death_date: "",
    description: "",
    photo_url: "",
    gender: null,
    tree_id: treeId
  };
}

export function TreePage() {
  const navigate = useNavigate();
  const { treeId } = useParams<{ treeId: string }>();
  const parsedTreeId = Number(treeId);
  const { setStatus } = useSession();
  const [form, setForm] = useState(createEmptyPerson(parsedTreeId));
  const [treeForm, setTreeForm] = useState<TreeUpdate>({
    name: "",
    description: "",
    is_public: false
  });
  const [accessForm, setAccessForm] = useState<TreeAccessGrantRequest>({
    email: "",
    access_level: "viewer"
  });
  const isValidTreeId = Number.isFinite(parsedTreeId) && parsedTreeId > 0;
  const treesQuery = useTreesQuery();
  const personsQuery = usePersonsByTreeQuery(parsedTreeId, isValidTreeId);
  const treeAccessQuery = useTreeAccessQuery(parsedTreeId, isValidTreeId);
  const createPersonMutation = useCreatePersonMutation(parsedTreeId);
  const updateTreeMutation = useUpdateTreeMutation(parsedTreeId);
  const deleteTreeMutation = useDeleteTreeMutation();
  const grantTreeAccessMutation = useGrantTreeAccessMutation(parsedTreeId);
  const updateTreeAccessMutation = useUpdateTreeAccessMutation(parsedTreeId);
  const revokeTreeAccessMutation = useRevokeTreeAccessMutation(parsedTreeId);

  const currentTree = useMemo<TreeRead | null>(
    () => (treesQuery.data ?? []).find((tree) => tree.id === parsedTreeId) ?? null,
    [parsedTreeId, treesQuery.data]
  );

  useEffect(() => {
    if (!isValidTreeId) {
      setStatus("Invalid tree id.");
      return;
    }

    setForm(createEmptyPerson(parsedTreeId));
  }, [isValidTreeId, parsedTreeId, setStatus]);

  useEffect(() => {
    if (!currentTree) {
      return;
    }

    setTreeForm({
      name: currentTree.name,
      description: currentTree.description ?? "",
      is_public: currentTree.is_public
    });
  }, [currentTree]);

  const personLinks = useMemo(
    () =>
      (personsQuery.data ?? []).map((person) => ({
        id: person.id,
        name: `${person.first_name} ${person.last_name ?? ""}`.trim() || `Person #${person.id}`
      })),
    [personsQuery.data]
  );

  async function handleTreeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await updateTreeMutation.mutateAsync({
        name: treeForm.name?.trim() || null,
        description: treeForm.description?.trim() || null,
        is_public: treeForm.is_public ?? null
      });
      setTreeForm({
        name: result.name,
        description: result.description ?? "",
        is_public: result.is_public
      });
      setStatus(`Updated tree #${result.id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function handleDeleteTree() {
    if (!currentTree) {
      return;
    }

    const confirmed = window.confirm(`Delete tree #${currentTree.id} and its related data?`);
    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteTreeMutation.mutateAsync(currentTree.id);
      setStatus(result.detail);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await createPersonMutation.mutateAsync({
        ...form,
        tree_id: parsedTreeId,
        middle_name: form.middle_name || null,
        last_name: form.last_name || null,
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
        description: form.description || null,
        photo_url: form.photo_url || null
      });
      setForm(createEmptyPerson(parsedTreeId));
      setStatus(`Created person #${result.person_id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function handleAccessSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await grantTreeAccessMutation.mutateAsync({
        email: accessForm.email.trim(),
        access_level: accessForm.access_level
      });
      setAccessForm({
        email: "",
        access_level: result.access_level
      });
      setStatus(`Granted ${result.access_level} access to user #${result.user_id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function handleToggleAccess(targetUserId: number, currentAccessLevel: "owner" | "editor" | "viewer") {
    if (currentAccessLevel === "owner") {
      return;
    }

    try {
      const nextAccessLevel = currentAccessLevel === "editor" ? "viewer" : "editor";
      const result = await updateTreeAccessMutation.mutateAsync({
        targetUserId,
        payload: {
          access_level: nextAccessLevel
        }
      });
      setStatus(`Updated user #${result.user_id} to ${result.access_level}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function handleRevokeAccess(targetUserId: number) {
    try {
      const result = await revokeTreeAccessMutation.mutateAsync(targetUserId);
      setStatus(result.detail);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  return (
    <PageSection
      title={currentTree ? currentTree.name : `Tree #${parsedTreeId}`}
      description="Review tree settings, keep the people list up to date, and manage who can work with this tree."
    >
      <div className="page-grid">
        <Panel title="Tree settings" subtitle="Keep the tree name, description, and visibility in sync with how you want to use it.">
          {!currentTree && treesQuery.isLoading ? <p className="state-message">Loading tree details...</p> : null}
          {!currentTree && !treesQuery.isLoading && !treesQuery.isError ? (
            <p className="state-message state-empty">Tree details are limited until the tree list is loaded.</p>
          ) : null}
          {treesQuery.isError ? <p className="state-message state-error">{getErrorMessage(treesQuery.error)}</p> : null}
          <form className="stack" onSubmit={handleTreeSubmit}>
            <Field
              label="Tree name"
              value={treeForm.name ?? ""}
              onChange={(value) => setTreeForm((current) => ({ ...current, name: value }))}
            />
            <Field
              label="Description"
              value={treeForm.description ?? ""}
              multiline
              onChange={(value) => setTreeForm((current) => ({ ...current, description: value }))}
            />
            <label className="checkbox">
              <input
                checked={treeForm.is_public ?? false}
                onChange={(event) =>
                  setTreeForm((current) => ({ ...current, is_public: event.target.checked }))
                }
                type="checkbox"
              />
              <span>Make this tree visible to other users</span>
            </label>
            <button type="submit">Save tree</button>
          </form>
          <div className="danger-zone">
            <strong>Danger zone</strong>
            <p>Deleting a tree also removes its related people, relationships, and access entries.</p>
            <button className="ghost danger-button" type="button" onClick={() => void handleDeleteTree()}>
              Delete tree
            </button>
          </div>
        </Panel>

        <Panel title="Add a person" subtitle="Use this quick form to keep building the tree person by person.">
          <form className="stack" onSubmit={handleSubmit}>
            <Field
              label="First name"
              value={form.first_name}
              onChange={(value) => setForm((current) => ({ ...current, first_name: value }))}
            />
            <Field
              label="Patronymic / Middle name"
              value={form.middle_name ?? ""}
              onChange={(value) => setForm((current) => ({ ...current, middle_name: value }))}
            />
            <Field
              label="Last name"
              value={form.last_name ?? ""}
              onChange={(value) => setForm((current) => ({ ...current, last_name: value }))}
            />
            <Field
              label="Birth date"
              type="date"
              value={form.birth_date ?? ""}
              onChange={(value) => setForm((current) => ({ ...current, birth_date: value }))}
            />
            <Field
              label="Death date"
              type="date"
              value={form.death_date ?? ""}
              onChange={(value) => setForm((current) => ({ ...current, death_date: value }))}
            />
            <Field
              label="Photo URL"
              value={form.photo_url ?? ""}
              onChange={(value) => setForm((current) => ({ ...current, photo_url: value }))}
            />
            <Field
              label="Description"
              value={form.description ?? ""}
              multiline
              onChange={(value) => setForm((current) => ({ ...current, description: value }))}
            />
            <label>
              <span>Gender</span>
              <select
                value={form.gender ?? ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    gender: event.target.value
                      ? (event.target.value as NonNullable<typeof current.gender>)
                      : null
                  }))
                }
              >
                <option value="">Unknown</option>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="other">other</option>
              </select>
            </label>
            <button type="submit">Add person</button>
          </form>
        </Panel>

        <Panel title="People in this tree" subtitle="Open a person card to review details, edit data, or remove them from the tree.">
          <div className="stack">
            <div className="actions-row">
              <button className="ghost" type="button" onClick={() => void personsQuery.refetch()}>
                Refresh people
              </button>
              <Link className="ghost-link" to={`/relationships?treeId=${parsedTreeId}`}>
                Manage relationships
              </Link>
              <Link className="ghost-link" to={`/kinship?treeId=${parsedTreeId}`}>
                Check kinship
              </Link>
            </div>
            {personsQuery.isLoading ? <p className="state-message">Loading people...</p> : null}
            {personsQuery.isError ? <p className="state-message state-error">{getErrorMessage(personsQuery.error)}</p> : null}
            {!personsQuery.isLoading && !personsQuery.isError && (personsQuery.data?.length ?? 0) === 0 ? (
              <p className="state-message state-empty">
                No people in this tree yet. Add the first person using the form on this page.
              </p>
            ) : null}
            <div className="list">
              {personLinks.map((person) => (
                <Link className="list-item" key={person.id} to={`/persons/${person.id}`}>
                  <strong>{person.name}</strong>
                  <span>ID {person.id}</span>
                </Link>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Tree access" subtitle="Grant, update, or revoke access for other users who need to work with this tree.">
          <form className="stack" onSubmit={handleAccessSubmit}>
            <Field
              label="User email"
              type="email"
              value={accessForm.email}
              onChange={(value) => setAccessForm((current) => ({ ...current, email: value }))}
            />
            <label>
              <span>Access level</span>
              <select
                value={accessForm.access_level}
                onChange={(event) =>
                  setAccessForm((current) => ({
                    ...current,
                    access_level: event.target.value as TreeAccessGrantRequest["access_level"]
                  }))
                }
              >
                <option value="viewer">viewer</option>
                <option value="editor">editor</option>
              </select>
            </label>
            <button type="submit">Grant access</button>
          </form>

          {treeAccessQuery.isLoading ? <p className="state-message">Loading access list...</p> : null}
          {treeAccessQuery.isError ? <p className="state-message state-error">{getErrorMessage(treeAccessQuery.error)}</p> : null}
          {!treeAccessQuery.isLoading && !treeAccessQuery.isError && (treeAccessQuery.data?.length ?? 0) === 0 ? (
            <p className="state-message state-empty">No additional access entries yet.</p>
          ) : null}
          <div className="list">
            {(treeAccessQuery.data ?? []).map((entry) => (
              <div className="list-item" key={entry.user_id}>
                <div className="list-item-main">
                  <strong>{entry.email}</strong>
                  <span>
                    User #{entry.user_id} | {entry.access_level}
                  </span>
                </div>
                {entry.access_level === "owner" ? (
                  <span>Owner access cannot be changed here.</span>
                ) : (
                  <div className="actions-row">
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => void handleToggleAccess(entry.user_id, entry.access_level)}
                    >
                      Change to {entry.access_level === "editor" ? "viewer" : "editor"}
                    </button>
                    <button
                      className="ghost"
                      type="button"
                      onClick={() => void handleRevokeAccess(entry.user_id)}
                    >
                      Revoke
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      </div>
      {updateTreeMutation.isPending ? <p className="state-message">Saving tree changes...</p> : null}
      {updateTreeMutation.isError ? <p className="state-message state-error">{getErrorMessage(updateTreeMutation.error)}</p> : null}
      {deleteTreeMutation.isPending ? <p className="state-message">Deleting tree...</p> : null}
      {deleteTreeMutation.isError ? <p className="state-message state-error">{getErrorMessage(deleteTreeMutation.error)}</p> : null}
      {createPersonMutation.isPending ? <p className="state-message">Saving person...</p> : null}
      {createPersonMutation.isError ? <p className="state-message state-error">{getErrorMessage(createPersonMutation.error)}</p> : null}
      {grantTreeAccessMutation.isPending ? <p className="state-message">Granting access...</p> : null}
      {grantTreeAccessMutation.isError ? <p className="state-message state-error">{getErrorMessage(grantTreeAccessMutation.error)}</p> : null}
      {updateTreeAccessMutation.isPending ? <p className="state-message">Updating access...</p> : null}
      {updateTreeAccessMutation.isError ? <p className="state-message state-error">{getErrorMessage(updateTreeAccessMutation.error)}</p> : null}
      {revokeTreeAccessMutation.isPending ? <p className="state-message">Revoking access...</p> : null}
      {revokeTreeAccessMutation.isError ? <p className="state-message state-error">{getErrorMessage(revokeTreeAccessMutation.error)}</p> : null}
    </PageSection>
  );
}
