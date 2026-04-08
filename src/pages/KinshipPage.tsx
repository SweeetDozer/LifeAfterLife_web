import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGraphPathQuery, useKinshipQuery } from "../entities/kinship/model/use-kinship-queries";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/errors";
import { Field } from "../shared/ui/Field";
import { PageSection } from "../shared/ui/PageSection";
import { Panel } from "../shared/ui/Panel";

export function KinshipPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parsedTreeId = Number(searchParams.get("treeId") ?? "");
  const { setStatus } = useSession();
  const [form, setForm] = useState({
    from_person_id: "",
    to_person_id: ""
  });
  const [graphQueryParams, setGraphQueryParams] = useState<{
    treeId: number;
    fromPersonId: number;
    toPersonId: number;
  } | null>(null);
  const [kinshipQueryParams, setKinshipQueryParams] = useState<{
    treeId: number;
    fromPersonId: number;
    toPersonId: number;
  } | null>(null);
  const graphPathQuery = useGraphPathQuery(graphQueryParams);
  const kinshipQuery = useKinshipQuery(kinshipQueryParams);

  async function handlePathSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!Number.isFinite(parsedTreeId) || parsedTreeId <= 0) {
      setStatus("Tree id is required in /kinship?treeId=...");
      return;
    }

    setGraphQueryParams({
      treeId: parsedTreeId,
      fromPersonId: Number(form.from_person_id),
      toPersonId: Number(form.to_person_id)
    });
    setStatus("Graph path requested.");
  }

  async function handleKinshipLoad() {
    if (!Number.isFinite(parsedTreeId) || parsedTreeId <= 0) {
      setStatus("Tree id is required in /kinship?treeId=...");
      return;
    }

    setKinshipQueryParams({
      treeId: parsedTreeId,
      fromPersonId: Number(form.from_person_id),
      toPersonId: Number(form.to_person_id)
    });
    setStatus("Kinship requested.");
  }

  return (
    <PageSection title={`Kinship for tree #${parsedTreeId}`} description="Graph and kinship queries are isolated from the tree and person pages.">
      <div className="page-grid">
        <Panel title="Find path and kinship">
          <form className="stack" onSubmit={handlePathSubmit}>
            <Field
              label="Tree ID"
              type="number"
              value={Number.isFinite(parsedTreeId) && parsedTreeId > 0 ? String(parsedTreeId) : ""}
              onChange={(value) => setSearchParams(value ? { treeId: value } : {})}
            />
            <Field
              label="From person ID"
              type="number"
              value={form.from_person_id}
              onChange={(value) => setForm((current) => ({ ...current, from_person_id: value }))}
            />
            <Field
              label="To person ID"
              type="number"
              value={form.to_person_id}
              onChange={(value) => setForm((current) => ({ ...current, to_person_id: value }))}
            />
            <button type="submit">Find graph path</button>
            <button className="ghost" type="button" onClick={() => void handleKinshipLoad()}>
              Find kinship
            </button>
          </form>
        </Panel>

        <Panel title="Results">
          <div className="detail-list">
            <span>
              Path:{" "}
              {graphPathQuery.isLoading
                ? "Loading..."
                : graphPathQuery.isError
                  ? getErrorMessage(graphPathQuery.error)
                  : graphPathQuery.data
                    ? graphPathQuery.data.path.join(" -> ")
                    : "No data yet"}
            </span>
            <span>
              Kinship:{" "}
              {kinshipQuery.isLoading
                ? "Loading..."
                : kinshipQuery.isError
                  ? getErrorMessage(kinshipQuery.error)
                  : kinshipQuery.data
                    ? `${kinshipQuery.data.result} | ${kinshipQuery.data.line}`
                    : "No data yet"}
            </span>
            <Link
              className="ghost-link"
              to={Number.isFinite(parsedTreeId) && parsedTreeId > 0 ? `/trees/${parsedTreeId}` : "/dashboard"}
            >
              Back to tree
            </Link>
          </div>
        </Panel>
      </div>
    </PageSection>
  );
}
