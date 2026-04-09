import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCreateTreeMutation, useTreesQuery } from "../entities/tree/model/use-tree-queries";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/client";
import { Field } from "../shared/ui/Field";
import { PageSection } from "../shared/ui/PageSection";
import { Panel } from "../shared/ui/Panel";
import type { TreeCreate } from "../shared/types/api";

const initialTreeForm: TreeCreate = {
  name: "",
  description: "",
  is_public: false
};

export function DashboardPage() {
  const { setStatus } = useSession();
  const treesQuery = useTreesQuery();
  const createTreeMutation = useCreateTreeMutation();
  const [form, setForm] = useState(initialTreeForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await createTreeMutation.mutateAsync(form);
      setForm(initialTreeForm);
      setStatus(`Created tree #${result.tree_id}.`);
    } catch (error) {
      setStatus(getErrorMessage(error));
    }
  }

  return (
    <PageSection title="Your trees" description="Create a tree and open it to manage people, relationships, and kinship lookups.">
      <div className="page-grid">
        <Panel title="Create a tree">
          <form className="stack" onSubmit={handleSubmit}>
            <Field
              label="Tree name"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            />
            <Field
              label="Short description"
              value={form.description ?? ""}
              multiline
              onChange={(value) => setForm((current) => ({ ...current, description: value }))}
            />
            <label className="checkbox">
              <input
                checked={form.is_public ?? false}
                onChange={(event) =>
                  setForm((current) => ({ ...current, is_public: event.target.checked }))
                }
                type="checkbox"
              />
              <span>Allow other users to see this tree</span>
            </label>
            <button type="submit">Create tree</button>
          </form>
        </Panel>

        <Panel title="Available trees" subtitle="Open a tree to manage people and relationships.">
          <div className="stack">
            <button className="ghost" type="button" onClick={() => void treesQuery.refetch()}>
              Refresh list
            </button>
            {treesQuery.isLoading ? <p>Loading your trees...</p> : null}
            {treesQuery.isError ? <p>{getErrorMessage(treesQuery.error)}</p> : null}
            {!treesQuery.isLoading && !treesQuery.isError && (treesQuery.data?.length ?? 0) === 0 ? (
              <p>You do not have any trees yet. Create the first one using the form on the left.</p>
            ) : null}
            <div className="list">
              {(treesQuery.data ?? []).map((tree) => (
                <Link className="list-item" key={tree.id} to={`/trees/${tree.id}`}>
                  <strong>{tree.name}</strong>
                  <span>
                    #{tree.id} | {tree.access_level}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Panel>
      </div>
      {createTreeMutation.isPending ? <p>Creating tree...</p> : null}
      {createTreeMutation.isError ? <p>{getErrorMessage(createTreeMutation.error)}</p> : null}
    </PageSection>
  );
}
