import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/query-keys";
import { createPerson, deletePerson, getPerson, getPersonsByTree, updatePerson } from "../api/person-api";

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

export function useUpdatePersonMutation(personId: number, treeId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Parameters<typeof updatePerson>[1]) => updatePerson(personId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.person(personId) });
      if (treeId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.personsByTree(treeId) });
      }
    }
  });
}

export function useDeletePersonMutation(personId: number, treeId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deletePerson(personId),
    onSuccess: () => {
      void queryClient.removeQueries({ queryKey: queryKeys.person(personId) });
      if (treeId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.personsByTree(treeId) });
      }
    }
  });
}
