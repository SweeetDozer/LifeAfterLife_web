import { apiClient, unwrap } from "../../../shared/api/client";

interface GraphQuery {
  tree_id: number;
  from_person_id: number;
  to_person_id: number;
}

export async function getGraphPath(params: GraphQuery) {
  const { data, error, response } = await apiClient.GET("/graph/path", {
    params: {
      query: params
    }
  });

  return unwrap(data, error, response);
}

export async function getKinship(params: GraphQuery) {
  const { data, error, response } = await apiClient.GET("/kinship/", {
    params: {
      query: params
    }
  });

  return unwrap(data, error, response);
}
