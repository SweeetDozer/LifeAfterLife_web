import { apiClient, unwrap } from "../../../shared/api/client";
import type {
  TreeAccessGrantRequest,
  TreeAccessUpdateRequest,
  TreeCreate,
  TreeUpdate
} from "../../../shared/types/api";

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

// TODO: wire tree edit/delete/access management into UI when those flows are added.
export async function updateTree(treeId: number, payload: TreeUpdate) {
  const { data, error, response } = await apiClient.PATCH("/trees/{tree_id}", {
    params: {
      path: {
        tree_id: treeId
      }
    },
    body: payload
  });

  return unwrap(data, error, response);
}

export async function deleteTree(treeId: number) {
  const { data, error, response } = await apiClient.DELETE("/trees/{tree_id}", {
    params: {
      path: {
        tree_id: treeId
      }
    }
  });

  return unwrap(data, error, response);
}

export async function getTreeAccess(treeId: number) {
  const { data, error, response } = await apiClient.GET("/trees/{tree_id}/access", {
    params: {
      path: {
        tree_id: treeId
      }
    }
  });

  return unwrap(data, error, response);
}

export async function grantTreeAccess(treeId: number, payload: TreeAccessGrantRequest) {
  const { data, error, response } = await apiClient.POST("/trees/{tree_id}/access", {
    params: {
      path: {
        tree_id: treeId
      }
    },
    body: payload
  });

  return unwrap(data, error, response);
}

export async function updateTreeAccess(
  treeId: number,
  targetUserId: number,
  payload: TreeAccessUpdateRequest
) {
  const { data, error, response } = await apiClient.PATCH(
    "/trees/{tree_id}/access/{target_user_id}",
    {
      params: {
        path: {
          tree_id: treeId,
          target_user_id: targetUserId
        }
      },
      body: payload
    }
  );

  return unwrap(data, error, response);
}

export async function revokeTreeAccess(treeId: number, targetUserId: number) {
  const { data, error, response } = await apiClient.DELETE(
    "/trees/{tree_id}/access/{target_user_id}",
    {
      params: {
        path: {
          tree_id: treeId,
          target_user_id: targetUserId
        }
      }
    }
  );

  return unwrap(data, error, response);
}
