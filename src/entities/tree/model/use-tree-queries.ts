import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/query-keys";
import { createTree, getTrees } from "../api/tree-api";

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
