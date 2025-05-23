import { useCurrentProject } from '@latitude-data/web-ui/providers'
import useFetcher from '$/hooks/useFetcher'
import { ROUTES } from '$/services/routes'
import useSWR, { SWRConfiguration } from 'swr'

type CountersResult = {
  totalCount: number
  costInMillicents: number
  tokens: number
}
export default function useEvaluationResultsCounters(
  {
    commitUuid,
    documentUuid,
    evaluationId,
  }: {
    commitUuid: string
    documentUuid: string
    evaluationId: number
  },
  { fallbackData }: SWRConfiguration = {},
) {
  // TODO: remove this hook, pass the project id as a parameter
  const { project } = useCurrentProject()
  const fetcher = useFetcher<CountersResult>(
    ROUTES.api.projects
      .detail(project.id)
      .commits.detail(commitUuid)
      .documents.detail(documentUuid)
      .evaluations.detail({ evaluationId }).evaluationResults.counters,
    { fallback: null },
  )
  const { data, isLoading, error, mutate } = useSWR(
    ['evaluationResultsCounters', commitUuid, documentUuid, evaluationId],
    fetcher,
    { fallbackData },
  )

  return {
    data,
    isLoading,
    error,
    refetch: mutate,
  }
}
