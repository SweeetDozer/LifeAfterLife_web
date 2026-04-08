import { apiClient } from "../../../shared/api/client";
import { unwrap } from "../../../shared/api/result";
import type { RelationshipCreate } from "../../../shared/types/api";

export async function createRelationship(payload: RelationshipCreate) {
  const { data, error, response } = await apiClient.POST("/relationships/", {
    body: payload
  });

  return unwrap(data, error, response);
}
