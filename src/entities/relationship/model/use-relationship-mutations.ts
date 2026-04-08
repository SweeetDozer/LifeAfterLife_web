import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/query-keys";
import { createRelationship } from "../api/relationship-api";

export function useCreateRelationshipMutation(treeId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRelationship,
    onSuccess: () => {
      if (treeId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.personsByTree(treeId) });
      }
    }
  });
}
