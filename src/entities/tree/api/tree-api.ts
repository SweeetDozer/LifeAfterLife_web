import { apiClient } from "../../../shared/api/client";
import { unwrap } from "../../../shared/api/result";
import type { TreeCreate } from "../../../shared/types/api";

export async function getTrees() {
  const { data, error, response } = await apiClient.GET("/trees/");
  return unwrap(data, error, response);
}

export async function createTree(payload: TreeCreate) {
  const { data, error, response } = await apiClient.POST("/trees/", {
    body: payload
  });

  return unwrap(data, error, response);
}
