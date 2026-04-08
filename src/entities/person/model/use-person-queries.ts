import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/query-keys";
import { createPerson, getPerson, getPersonsByTree } from "../api/person-api";

export function usePersonsByTreeQuery(treeId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.personsByTree(treeId),
    queryFn: () => getPersonsByTree(treeId),
    enabled
  });
}

export function usePersonQuery(personId: number, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.person(personId),
    queryFn: () => getPerson(personId),
    enabled
  });
}

export function useCreatePersonMutation(treeId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPerson,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.personsByTree(treeId) });
    }
  });
}
