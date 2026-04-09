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
    <PageSection title="Dashboard" description="Tree list and tree creation live here now, not in App.tsx.">
      <div className="page-grid">
        <Panel title="Create tree">
          <form className="stack" onSubmit={handleSubmit}>
            <Field
              label="Name"
              value={form.name}
              onChange={(value) => setForm((current) => ({ ...current, name: value }))}
            />
            <Field
              label="Description"
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
              <span>Public tree</span>
            </label>
            <button type="submit">Create tree</button>
          </form>
        </Panel>

        <Panel title="Trees" subtitle="Each item routes to a dedicated tree page.">
          <div className="stack">
            <button className="ghost" type="button" onClick={() => void treesQuery.refetch()}>
              Reload trees
            </button>
            {treesQuery.isLoading ? <p>Loading trees...</p> : null}
            {treesQuery.isError ? <p>{getErrorMessage(treesQuery.error)}</p> : null}
            {!treesQuery.isLoading && !treesQuery.isError && (treesQuery.data?.length ?? 0) === 0 ? (
              <p>No trees yet. Create the first one using the form.</p>
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
      {createTreeMutation.isPending ? <p>Saving tree...</p> : null}
      {createTreeMutation.isError ? <p>{getErrorMessage(createTreeMutation.error)}</p> : null}
    </PageSection>
  );
}
