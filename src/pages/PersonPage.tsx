import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { usePersonQuery } from "../entities/person/model/use-person-queries";
import { useSession } from "../features/auth/model/session-context";
import { getErrorMessage } from "../shared/api/errors";
import { PageSection } from "../shared/ui/PageSection";
import { Panel } from "../shared/ui/Panel";

export function PersonPage() {
  const { personId } = useParams<{ personId: string }>();
  const parsedPersonId = Number(personId);
  const { setStatus } = useSession();
  const isValidPersonId = Number.isFinite(parsedPersonId) && parsedPersonId > 0;
  const personQuery = usePersonQuery(parsedPersonId, isValidPersonId);

  useEffect(() => {
    if (!isValidPersonId) {
      setStatus("Invalid person id.");
    }
  }, [isValidPersonId, setStatus]);

  return (
    <PageSection title={`Person #${parsedPersonId}`} description="Person details come from a dedicated page-level fetch.">
      <Panel title={personQuery.data ? `${personQuery.data.first_name} ${personQuery.data.last_name ?? ""}`.trim() : "Person details"}>
        {personQuery.isLoading ? <p>Loading person...</p> : null}
        {personQuery.isError ? <p>{getErrorMessage(personQuery.error)}</p> : null}
        {personQuery.data ? (
          <div className="detail-list">
            <span>ID: {personQuery.data.id}</span>
            <span>Tree: {personQuery.data.tree_id}</span>
            <span>Gender: {personQuery.data.gender ?? "unknown"}</span>
            <span>Description: {personQuery.data.description ?? "No description"}</span>
            <Link className="ghost-link" to={`/trees/${personQuery.data.tree_id}`}>
              Back to tree
            </Link>
          </div>
        ) : null}
      </Panel>
    </PageSection>
  );
}
