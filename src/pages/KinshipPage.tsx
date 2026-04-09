import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGraphPathQuery, useKinshipQuery } from "../entities/kinship/model/use-kinship-queries";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/client";
import { Field } from "../shared/ui/Field";
import { PageSection } from "../shared/ui/PageSection";
import { Panel } from "../shared/ui/Panel";

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function hasSameParams(
  current: { treeId: number; fromPersonId: number; toPersonId: number } | null,
  next: { treeId: number; fromPersonId: number; toPersonId: number }
) {
  return (
    current?.treeId === next.treeId &&
    current?.fromPersonId === next.fromPersonId &&
    current?.toPersonId === next.toPersonId
  );
}

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

    const fromPersonId = parsePositiveId(form.from_person_id);
    const toPersonId = parsePositiveId(form.to_person_id);
    if (!fromPersonId || !toPersonId) {
      setStatus("From person ID and To person ID must be positive integers.");
      return;
    }

    const nextParams = {
      treeId: parsedTreeId,
      fromPersonId,
      toPersonId
    };

    if (hasSameParams(graphQueryParams, nextParams)) {
      void graphPathQuery.refetch();
    } else {
      setGraphQueryParams(nextParams);
    }

    setStatus("Graph path requested.");
  }

  async function handleKinshipLoad() {
    if (!Number.isFinite(parsedTreeId) || parsedTreeId <= 0) {
      setStatus("Tree id is required in /kinship?treeId=...");
      return;
    }

    const fromPersonId = parsePositiveId(form.from_person_id);
    const toPersonId = parsePositiveId(form.to_person_id);
    if (!fromPersonId || !toPersonId) {
      setStatus("From person ID and To person ID must be positive integers.");
      return;
    }

    const nextParams = {
      treeId: parsedTreeId,
      fromPersonId,
      toPersonId
    };

    if (hasSameParams(kinshipQueryParams, nextParams)) {
      void kinshipQuery.refetch();
    } else {
      setKinshipQueryParams(nextParams);
    }

    setStatus("Kinship requested.");
  }

  return (
    <PageSection
      title={`Kinship for tree #${parsedTreeId}`}
      description="Compare two people in the same tree to see the raw graph path and the interpreted kinship result."
    >
      <div className="page-grid">
        <Panel title="Select two people" subtitle="Use the same tree ID and compare one person against another.">
          <form className="stack" onSubmit={handlePathSubmit}>
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
              value={form.from_person_id}
              onChange={(value) => setForm((current) => ({ ...current, from_person_id: value }))}
            />
            <Field
              label="To person ID"
              min={1}
              type="number"
              value={form.to_person_id}
              onChange={(value) => setForm((current) => ({ ...current, to_person_id: value }))}
            />
            <button type="submit">Find graph path</button>
            <button className="ghost" type="button" onClick={() => void handleKinshipLoad()}>
              Find kinship result
            </button>
          </form>
        </Panel>

        <Panel title="Results" subtitle="The graph path shows raw IDs, while kinship gives the readable interpretation.">
          <div className="stack">
            <div className="result-card">
              <strong>Graph path</strong>
              {graphPathQuery.isLoading ? <p className="state-message">Loading graph path...</p> : null}
              {graphPathQuery.isError ? (
                <p className="state-message state-error">{getErrorMessage(graphPathQuery.error)}</p>
              ) : null}
              {!graphPathQuery.isLoading && !graphPathQuery.isError && !graphPathQuery.data ? (
                <p className="state-message state-empty">No graph path requested yet.</p>
              ) : null}
              {graphPathQuery.data ? (
                <>
                  <p className="result-primary">{graphPathQuery.data.path.join(" -> ")}</p>
                  <p className="result-secondary">Path length: {graphPathQuery.data.path.length}</p>
                </>
              ) : null}
            </div>

            <div className="result-card">
              <strong>Kinship interpretation</strong>
              {kinshipQuery.isLoading ? <p className="state-message">Loading kinship result...</p> : null}
              {kinshipQuery.isError ? (
                <p className="state-message state-error">{getErrorMessage(kinshipQuery.error)}</p>
              ) : null}
              {!kinshipQuery.isLoading && !kinshipQuery.isError && !kinshipQuery.data ? (
                <p className="state-message state-empty">No kinship result requested yet.</p>
              ) : null}
              {kinshipQuery.data ? (
                <div className="detail-list">
                  <span className="result-primary">{kinshipQuery.data.result}</span>
                  <span>{kinshipQuery.data.line}</span>
                  <span>Path: {kinshipQuery.data.path.join(" -> ")}</span>
                  <span>
                    Relations:{" "}
                    {kinshipQuery.data.relations.length > 0
                      ? kinshipQuery.data.relations.map((relation) => `${relation.type} -> ${relation.to}`).join(", ")
                      : "No detailed relation steps provided"}
                  </span>
                  <span>LCA: {kinshipQuery.data.lca ?? "Not provided"}</span>
                </div>
              ) : null}
            </div>

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
