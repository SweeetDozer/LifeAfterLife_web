import { apiClient, unwrap } from "../../../shared/api/client";
import type { RelationshipCreate } from "../../../shared/types/api";

export async function createRelationship(payload: RelationshipCreate) {
  const { data, error, response } = await apiClient.POST("/relationships/", {
    body: payload
  });

  return unwrap(data, error, response);
}
