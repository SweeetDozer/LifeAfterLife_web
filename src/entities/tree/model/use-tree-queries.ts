import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/query-keys";
import {
  createTree,
  deleteTree,
  getTreeAccess,
  getTrees,
  grantTreeAccess,
  revokeTreeAccess,
  updateTree,
  updateTreeAccess
} from "../api/tree-api";
import type { TreeAccessGrantRequest, TreeAccessUpdateRequest, TreeUpdate } from "../../../shared/types/api";

export function useTreesQuery() {
  return useQuery({
    queryKey: queryKeys.trees,
    queryFn: getTrees
  });
}

export function useCreateTreeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTree,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
    }
  });
}

export function useUpdateTreeMutation(treeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TreeUpdate) => updateTree(treeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
    }
  });
}

export function useDeleteTreeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTree,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
    }
  });
}

export function useTreeAccessQuery(treeId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.treeAccess(treeId),
    queryFn: () => getTreeAccess(treeId),
    enabled
  });
}

export function useGrantTreeAccessMutation(treeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TreeAccessGrantRequest) => grantTreeAccess(treeId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.treeAccess(treeId) });
    }
  });
}

export function useUpdateTreeAccessMutation(treeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      targetUserId,
      payload
    }: {
      targetUserId: number;
      payload: TreeAccessUpdateRequest;
    }) => updateTreeAccess(treeId, targetUserId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.treeAccess(treeId) });
    }
  });
}

export function useRevokeTreeAccessMutation(treeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) => revokeTreeAccess(treeId, targetUserId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.treeAccess(treeId) });
    }
  });
}
