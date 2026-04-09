import { useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePersonsByTreeQuery } from "../entities/person/model/use-person-queries";
import {
  useCreateRelationshipMutation,
  useDeleteRelationshipMutation
} from "../entities/relationship/model/use-relationship-mutations";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/client";
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
  const deleteRelationshipMutation = useDeleteRelationshipMutation(isValidTreeId ? parsedTreeId : null);
  const [form, setForm] = useState<RelationshipCreate>({
    from_person_id: 0,
    to_person_id: 0,
    relationship_type: "parent"
  });
  const [relationshipIdToDelete, setRelationshipIdToDelete] = useState("");
  const [lastCreatedRelationshipId, setLastCreatedRelationshipId] = useState<number | null>(null);

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
      setLastCreatedRelationshipId(result.relationship_id);
      setRelationshipIdToDelete(String(result.relationship_id));
      setStatus(`Created relationship #${result.relationship_id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  async function handleDeleteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await handleDeleteRelationshipById(relationshipIdToDelete);
  }

  async function handleDeleteRelationshipById(rawRelationshipId: string) {
    const relationshipId = parsePositiveId(Number(rawRelationshipId));
    if (!relationshipId) {
      setStatus("Relationship ID must be a positive integer.");
      return;
    }

    try {
      const result = await deleteRelationshipMutation.mutateAsync(relationshipId);
      if (lastCreatedRelationshipId === relationshipId) {
        setLastCreatedRelationshipId(null);
      }
      setRelationshipIdToDelete("");
      setStatus(
        `Deleted ${result.deleted_relationships} relationship(s). ${result.detail}`
      );
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  return (
    <PageSection
      title={`Relationships for tree #${parsedTreeId}`}
      description="Create or remove direct relationships between people in the selected tree."
    >
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
            <label>
              <span>Person A</span>
              <select
                value={form.from_person_id ? String(form.from_person_id) : ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    from_person_id: Number(event.target.value) || 0
                  }))
                }
              >
                <option value="">Select a person</option>
                {personOptions.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.label} (ID {person.id})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Person B</span>
              <select
                value={form.to_person_id ? String(form.to_person_id) : ""}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    to_person_id: Number(event.target.value) || 0
                  }))
                }
              >
                <option value="">Select a person</option>
                {personOptions.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.label} (ID {person.id})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Relationship type from Person A to Person B</span>
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

        <Panel
          title="Delete relationship"
          subtitle="A full relationship list is not available in the current API flow, so deletion stays intentionally minimal."
        >
          <form className="stack" onSubmit={handleDeleteSubmit}>
            {lastCreatedRelationshipId ? (
              <button
                className="ghost"
                type="button"
                onClick={() => {
                  setRelationshipIdToDelete(String(lastCreatedRelationshipId));
                  void handleDeleteRelationshipById(String(lastCreatedRelationshipId));
                }}
              >
                Delete the last created relationship (#{lastCreatedRelationshipId})
              </button>
            ) : null}
            <Field
              label="Relationship ID"
              min={1}
              type="number"
              value={relationshipIdToDelete}
              onChange={setRelationshipIdToDelete}
            />
            <button className="ghost" type="submit">
              Delete by relationship ID
            </button>
          </form>
        </Panel>

        <Panel title="Available people">
          <div className="stack">
            <Link
              className="ghost-link"
              to={Number.isFinite(parsedTreeId) && parsedTreeId > 0 ? `/trees/${parsedTreeId}` : "/dashboard"}
            >
              Back to tree
            </Link>
            {personsQuery.isLoading ? <p>Loading people...</p> : null}
            {personsQuery.isError ? <p>{getErrorMessage(personsQuery.error)}</p> : null}
            {!personsQuery.isLoading && !personsQuery.isError && (personOptions.length === 0) ? (
              <p>No people found for this tree. Add people on the tree page first.</p>
            ) : null}
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
      {deleteRelationshipMutation.isPending ? <p>Deleting relationship...</p> : null}
      {deleteRelationshipMutation.isError ? <p>{getErrorMessage(deleteRelationshipMutation.error)}</p> : null}
    </PageSection>
  );
}
