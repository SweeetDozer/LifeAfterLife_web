import { apiClient, toApiError } from "./client";
import type { components } from "./generated/schema";
import { writeTokens } from "./token-storage";

function unwrap<TData, TError>(
  data: TData | undefined,
  error: TError | undefined,
  response: Response
): TData {
  if (data !== undefined) {
    return data;
  }

  throw toApiError(response, error ?? null);
}

export async function registerUser(payload: components["schemas"]["UserCreate"]) {
  const { data, error, response } = await apiClient.POST("/auth/register", {
    body: payload
  });

  return unwrap(data, error, response);
}

export async function loginUser(payload: components["schemas"]["UserLogin"]) {
  const { data, error, response } = await apiClient.POST("/auth/login", {
    body: payload
  });

  const result = unwrap(data, error, response);
  writeTokens({
    accessToken: result.access_token,
    refreshToken: null
  });

  return result;
}

export async function getTrees() {
  const { data, error, response } = await apiClient.GET("/trees/");
  return unwrap(data, error, response);
}

export async function createTree(payload: components["schemas"]["TreeCreate"]) {
  const { data, error, response } = await apiClient.POST("/trees/", {
    body: payload
  });

  return unwrap(data, error, response);
}

export async function createPerson(payload: components["schemas"]["PersonCreate"]) {
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

export async function createRelationship(payload: components["schemas"]["RelationshipCreate"]) {
  const { data, error, response } = await apiClient.POST("/relationships/", {
    body: payload
  });

  return unwrap(data, error, response);
}

export async function getGraphPath(params: {
  tree_id: number;
  from_person_id: number;
  to_person_id: number;
}) {
  const { data, error, response } = await apiClient.GET("/graph/path", {
    params: {
      query: params
    }
  });

  return unwrap(data, error, response);
}

export async function getKinship(params: {
  tree_id: number;
  from_person_id: number;
  to_person_id: number;
}) {
  const { data, error, response } = await apiClient.GET("/kinship/", {
    params: {
      query: params
    }
  });

  return unwrap(data, error, response);
}
