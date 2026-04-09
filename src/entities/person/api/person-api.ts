import { apiClient, unwrap } from "../../../shared/api/client";
import type { PersonCreate } from "../../../shared/types/api";

export async function createPerson(payload: PersonCreate) {
  const { data, error, response } = await apiClient.POST("/persons/", {
    body: payload
  });

  return unwrap(data, error, response);
}

export async function getPersonsByTree(treeId: number) {
  const { data, error, response } = await apiClient.GET("/persons/tree/{tree_id}", {
    params: {
      path: {
        tree_id: treeId
      }
    }
  });

  return unwrap(data, error, response);
}

export async function getPerson(personId: number) {
  const { data, error, response } = await apiClient.GET("/persons/{person_id}", {
    params: {
      path: {
        person_id: personId
      }
    }
  });

  return unwrap(data, error, response);
}
