import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePersonsByTreeQuery } from "../entities/person/model/use-person-queries";
import { useCreateRelationshipMutation } from "../entities/relationship/model/use-relationship-mutations";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/errors";
import { Field } from "../shared/ui/Field";
import { PageSection } from "../shared/ui/PageSection";
import { Panel } from "../shared/ui/Panel";
import type { RelationshipCreate } from "../shared/types/api";

type RelationshipType = RelationshipCreate["relationship_type"];

function parsePositiveId(value: number): number | null {
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function RelationshipsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsedTreeId = Number(searchParams.get("treeId") ?? "");
  const { setStatus } = useSession();
  const isValidTreeId = Number.isFinite(parsedTreeId) && parsedTreeId > 0;
  const personsQuery = usePersonsByTreeQuery(parsedTreeId, isValidTreeId);
  const createRelationshipMutation = useCreateRelationshipMutation(isValidTreeId ? parsedTreeId : null);
  const [form, setForm] = useState<RelationshipCreate>({
    from_person_id: 0,
    to_person_id: 0,
    relationship_type: "parent"
  });

  const personOptions = useMemo(
    () =>
      (personsQuery.data ?? []).map((person) => ({
        id: person.id,
        label: `${person.first_name} ${person.last_name ?? ""}`.trim() || `Person #${person.id}`
      })),
    [personsQuery.data]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidTreeId) {
      setStatus("Tree id is required in /relationships?treeId=...");
      return;
    }

    const fromPersonId = parsePositiveId(form.from_person_id);
    const toPersonId = parsePositiveId(form.to_person_id);
    if (!fromPersonId || !toPersonId) {
      setStatus("From person ID and To person ID must be positive integers.");
      return;
    }

    try {
      const result = await createRelationshipMutation.mutateAsync({
        ...form,
        from_person_id: fromPersonId,
        to_person_id: toPersonId
      });
      setStatus(`Created relationship #${result.relationship_id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  return (
    <PageSection title={`Relationships for tree #${parsedTreeId}`} description="Mutation-only page for relationship creation.">
      <div className="page-grid">
        <Panel title="Create relationship">
          <form className="stack" onSubmit={handleSubmit}>
            <Field
              label="Tree ID"
              min={1}
              type="number"
              value={Number.isFinite(parsedTreeId) && parsedTreeId > 0 ? String(parsedTreeId) : ""}
              onChange={(value) => setSearchParams(value ? { treeId: value } : {})}
            />
            <Field
              label="From person ID"
              min={1}
              type="number"
              value={form.from_person_id ? String(form.from_person_id) : ""}
              onChange={(value) =>
                setForm((current) => ({ ...current, from_person_id: Number(value) || 0 }))
              }
            />
            <Field
              label="To person ID"
              min={1}
              type="number"
              value={form.to_person_id ? String(form.to_person_id) : ""}
              onChange={(value) =>
                setForm((current) => ({ ...current, to_person_id: Number(value) || 0 }))
              }
            />
            <label>
              <span>Relationship type</span>
              <select
                value={form.relationship_type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    relationship_type: event.target.value as RelationshipType
                  }))
                }
              >
                <option value="parent">parent</option>
                <option value="spouse">spouse</option>
                <option value="sibling">sibling</option>
                <option value="friend">friend</option>
              </select>
            </label>
            <button type="submit">Create relationship</button>
          </form>
        </Panel>

        <Panel title="Persons in this tree">
          <div className="stack">
            <Link
              className="ghost-link"
              to={Number.isFinite(parsedTreeId) && parsedTreeId > 0 ? `/trees/${parsedTreeId}` : "/dashboard"}
            >
              Back to tree
            </Link>
            {personsQuery.isLoading ? <p>Loading persons...</p> : null}
            {personsQuery.isError ? <p>{getErrorMessage(personsQuery.error)}</p> : null}
            <div className="list">
              {personOptions.map((person) => (
                <div className="list-item" key={person.id}>
                  <strong>{person.label}</strong>
                  <span>ID {person.id}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>
      {createRelationshipMutation.isPending ? <p>Saving relationship...</p> : null}
      {createRelationshipMutation.isError ? <p>{getErrorMessage(createRelationshipMutation.error)}</p> : null}
    </PageSection>
  );
}
