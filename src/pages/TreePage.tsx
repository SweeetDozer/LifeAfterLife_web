import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useCreatePersonMutation, usePersonsByTreeQuery } from "../entities/person/model/use-person-queries";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/client";
import { Field } from "../shared/ui/Field";
import { PageSection } from "../shared/ui/PageSection";
import { Panel } from "../shared/ui/Panel";
import type { PersonCreate } from "../shared/types/api";

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
  const { treeId } = useParams<{ treeId: string }>();
  const parsedTreeId = Number(treeId);
  const { setStatus } = useSession();
  const [form, setForm] = useState(createEmptyPerson(parsedTreeId));
  const isValidTreeId = Number.isFinite(parsedTreeId) && parsedTreeId > 0;
  const personsQuery = usePersonsByTreeQuery(parsedTreeId, isValidTreeId);
  const createPersonMutation = useCreatePersonMutation(parsedTreeId);

  useEffect(() => {
    if (!isValidTreeId) {
      setStatus("Invalid tree id.");
      return;
    }

    setForm(createEmptyPerson(parsedTreeId));
  }, [isValidTreeId, parsedTreeId, setStatus]);

  const personLinks = useMemo(
    () =>
      (personsQuery.data ?? []).map((person) => ({
        id: person.id,
        name: `${person.first_name} ${person.last_name ?? ""}`.trim() || `Person #${person.id}`
      })),
    [personsQuery.data]
  );

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

  return (
    <PageSection title={`Tree #${parsedTreeId}`} description="Persons and person creation are isolated on this page.">
      <div className="page-grid">
        <Panel title="Create person">
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
            <button type="submit">Create person</button>
          </form>
        </Panel>

        <Panel title="Persons">
          <div className="stack">
            <div className="actions-row">
              <button className="ghost" type="button" onClick={() => void personsQuery.refetch()}>
                Reload persons
              </button>
              <Link className="ghost-link" to={`/relationships?treeId=${parsedTreeId}`}>
                Relationships
              </Link>
              <Link className="ghost-link" to={`/kinship?treeId=${parsedTreeId}`}>
                Kinship
              </Link>
            </div>
            {personsQuery.isLoading ? <p>Loading persons...</p> : null}
            {personsQuery.isError ? <p>{getErrorMessage(personsQuery.error)}</p> : null}
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
      </div>
      {createPersonMutation.isPending ? <p>Saving person...</p> : null}
      {createPersonMutation.isError ? <p>{getErrorMessage(createPersonMutation.error)}</p> : null}
    </PageSection>
  );
}
