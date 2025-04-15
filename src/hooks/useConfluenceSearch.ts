import { useMutation } from "@tanstack/react-query";
import {
  searchConfluence,
  SearchResult,
  SearchParams,
} from "../services/confluenceApi";

export function useConfluenceSearch() {
  return useMutation<SearchResult, Error, SearchParams>({
    mutationKey: ["confluenceSearch"],
    mutationFn: (params) => searchConfluence(params),
  });
}
