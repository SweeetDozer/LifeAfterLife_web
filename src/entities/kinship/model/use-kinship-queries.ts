import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../shared/api/query-keys";
import { getGraphPath, getKinship } from "../api/kinship-api";

interface GraphQueryInput {
  treeId: number;
  fromPersonId: number;
  toPersonId: number;
}

export function useGraphPathQuery(params: GraphQueryInput | null) {
  return useQuery({
    queryKey: params
      ? queryKeys.graphPath(params.treeId, params.fromPersonId, params.toPersonId)
      : ["graph", "path", "idle"],
    queryFn: () =>
      getGraphPath({
        tree_id: params!.treeId,
        from_person_id: params!.fromPersonId,
        to_person_id: params!.toPersonId
      }),
    enabled: Boolean(params)
  });
}

export function useKinshipQuery(params: GraphQueryInput | null) {
  return useQuery({
    queryKey: params
      ? queryKeys.kinship(params.treeId, params.fromPersonId, params.toPersonId)
      : ["kinship", "idle"],
    queryFn: () =>
      getKinship({
        tree_id: params!.treeId,
        from_person_id: params!.fromPersonId,
        to_person_id: params!.toPersonId
      }),
    enabled: Boolean(params)
  });
}
