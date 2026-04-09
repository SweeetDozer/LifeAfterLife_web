import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useDeletePersonMutation,
  usePersonQuery,
  useUpdatePersonMutation
} from "../entities/person/model/use-person-queries";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/client";
import { Field } from "../shared/ui/Field";
import { PageSection } from "../shared/ui/PageSection";
import { Panel } from "../shared/ui/Panel";
import type { PersonUpdate } from "../shared/types/api";

function toEditablePerson(person: NonNullable<ReturnType<typeof usePersonQuery>["data"]>): PersonUpdate {
  return {
    first_name: person.first_name,
    middle_name: person.middle_name ?? "",
    last_name: person.last_name ?? "",
    birth_date: person.birth_date ?? "",
    death_date: person.death_date ?? "",
    description: person.description ?? "",
    photo_url: person.photo_url ?? "",
    gender: person.gender ?? null
  };
}

export function PersonPage() {
  const navigate = useNavigate();
  const { personId } = useParams<{ personId: string }>();
  const parsedPersonId = Number(personId);
  const { setStatus } = useSession();
  const isValidPersonId = Number.isFinite(parsedPersonId) && parsedPersonId > 0;
  const personQuery = usePersonQuery(parsedPersonId, isValidPersonId);
  const treeId = personQuery.data?.tree_id ?? null;
  const updatePersonMutation = useUpdatePersonMutation(parsedPersonId, treeId);
  const deletePersonMutation = useDeletePersonMutation(parsedPersonId, treeId);
  const [form, setForm] = useState<PersonUpdate>({
    first_name: "",
    middle_name: "",
    last_name: "",
    birth_date: "",
    death_date: "",
    description: "",
    photo_url: "",
    gender: null
  });

  useEffect(() => {
    if (!isValidPersonId) {
      setStatus("Invalid person id.");
    }
  }, [isValidPersonId, setStatus]);

  useEffect(() => {
    if (!personQuery.data) {
      return;
    }

    setForm(toEditablePerson(personQuery.data));
  }, [personQuery.data]);

  const personTitle = useMemo(() => {
    if (!personQuery.data) {
      return "Person details";
    }

    return `${personQuery.data.first_name} ${personQuery.data.middle_name ?? ""} ${personQuery.data.last_name ?? ""}`
      .replace(/\s+/g, " ")
      .trim();
  }, [personQuery.data]);

  async function handleUpdateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await updatePersonMutation.mutateAsync({
        first_name: form.first_name?.trim() || null,
        middle_name: form.middle_name?.trim() || null,
        last_name: form.last_name?.trim() || null,
        birth_date: form.birth_date || null,
        death_date: form.death_date || null,
        description: form.description?.trim() || null,
        photo_url: form.photo_url?.trim() || null,
        gender: form.gender ?? null
      });
      setForm(toEditablePerson(result));
      setStatus(`Updated person #${result.id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function handleDeleteClick() {
    if (!personQuery.data) {
      return;
    }

    const confirmed = window.confirm(`Delete person #${personQuery.data.id}?`);
    if (!confirmed) {
      return;
    }

    try {
      const result = await deletePersonMutation.mutateAsync();
      setStatus(result.detail);
      navigate(`/trees/${personQuery.data.tree_id}`, { replace: true });
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  return (
    <PageSection title={`Person #${parsedPersonId}`} description="Person details come from a dedicated page-level fetch.">
      <div className="page-grid">
        <Panel title={personTitle}>
          {personQuery.isLoading ? <p>Loading person...</p> : null}
          {personQuery.isError ? <p>{getErrorMessage(personQuery.error)}</p> : null}
          {!personQuery.isLoading && !personQuery.isError && !personQuery.data ? <p>Person not found.</p> : null}
          {personQuery.data ? (
            <div className="detail-list">
              <span>ID: {personQuery.data.id}</span>
              <span>Tree: {personQuery.data.tree_id}</span>
              <span>Patronymic / Middle name: {personQuery.data.middle_name ?? "Not provided"}</span>
              <span>Birth date: {personQuery.data.birth_date ?? "Not provided"}</span>
              <span>Death date: {personQuery.data.death_date ?? "Not provided"}</span>
              <span>Gender: {personQuery.data.gender ?? "unknown"}</span>
              <span>Description: {personQuery.data.description ?? "No description"}</span>
              <Link className="ghost-link" to={`/trees/${personQuery.data.tree_id}`}>
                Back to tree
              </Link>
            </div>
          ) : null}
        </Panel>

        <Panel title="Edit person">
          {!personQuery.data ? (
            <p>Load a valid person to edit.</p>
          ) : (
            <form className="stack" onSubmit={handleUpdateSubmit}>
              <Field
                label="First name"
                value={form.first_name ?? ""}
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
              <div className="actions-row">
                <button type="submit">Save changes</button>
                <button className="ghost" type="button" onClick={() => void handleDeleteClick()}>
                  Delete person
                </button>
              </div>
            </form>
          )}
        </Panel>
      </div>
      {updatePersonMutation.isPending ? <p>Saving person...</p> : null}
      {updatePersonMutation.isError ? <p>{getErrorMessage(updatePersonMutation.error)}</p> : null}
      {deletePersonMutation.isPending ? <p>Deleting person...</p> : null}
      {deletePersonMutation.isError ? <p>{getErrorMessage(deletePersonMutation.error)}</p> : null}
    </PageSection>
  );
}
