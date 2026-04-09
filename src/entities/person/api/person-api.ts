import { apiClient, unwrap } from "../../../shared/api/client";
import type { PersonCreate, PersonUpdate } from "../../../shared/types/api";

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

// TODO: wire person edit/delete flows into UI when the screens are ready.
export async function updatePerson(personId: number, payload: PersonUpdate) {
  const { data, error, response } = await apiClient.PATCH("/persons/{person_id}", {
    params: {
      path: {
        person_id: personId
      }
    },
    body: payload
  });

  return unwrap(data, error, response);
}

export async function deletePerson(personId: number) {
  const { data, error, response } = await apiClient.DELETE("/persons/{person_id}", {
    params: {
      path: {
        person_id: personId
      }
    }
  });

  return unwrap(data, error, response);
}
