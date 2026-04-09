import { apiClient, unwrap } from "../../../shared/api/client";
import type { RelationshipCreate } from "../../../shared/types/api";

export async function createRelationship(payload: RelationshipCreate) {
  const { data, error, response } = await apiClient.POST("/relationships/", {
    body: payload
  });

  return unwrap(data, error, response);
}

// TODO: wire relationship delete into UI when relationship management screens exist.
export async function deleteRelationship(relationshipId: number) {
  const { data, error, response } = await apiClient.DELETE("/relationships/{relationship_id}", {
    params: {
      path: {
        relationship_id: relationshipId
      }
    }
  });

  return unwrap(data, error, response);
}
