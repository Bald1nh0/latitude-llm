import { createExperimentAction } from '$/actions/experiments'
import {
  EventArgs,
  useSockets,
} from '$/components/Providers/WebsocketsProvider/useSockets'
import useFetcher from '$/hooks/useFetcher'
import useLatitudeAction from '$/hooks/useLatitudeAction'
import { ROUTES } from '$/services/routes'
import { Experiment, ExperimentDto } from '@latitude-data/core/browser'
import { toast } from '@latitude-data/web-ui/atoms/Toast'
import useSWR, { SWRConfiguration } from 'swr'

const EMPTY_ARRAY: [] = []

export function useExperiments(
  {
    projectId,
    documentUuid,
    page = 1,
    pageSize = 25,
  }: {
    projectId: number
    documentUuid: string
    page?: number
    pageSize?: number
  },
  opts: SWRConfiguration & {
    onCreate?: (experiment: ExperimentDto) => void
  } = {},
) {
  const dataFetcher = useFetcher<ExperimentDto[]>(
    ROUTES.api.projects
      .detail(projectId)
      .documents.detail(documentUuid)
      .experiments.paginated({ page, pageSize }),
    {
      serializer: (item: unknown) => {
        if (Array.isArray(item)) {
          return item
            .map((experiment) => experiment as ExperimentDto)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
        }
        return []
      },
    },
  )

  const countFetcher = useFetcher<number>(
    ROUTES.api.projects.detail(projectId).documents.detail(documentUuid)
      .experiments.count,
  )

  const {
    data = EMPTY_ARRAY,
    isLoading,
    mutate,
  } = useSWR<ExperimentDto[]>(
    ['experiments', projectId, documentUuid, page, pageSize],
    dataFetcher,
    opts,
  )

  const { data: count, mutate: mutateCount } = useSWR<number>(
    ['experiments', projectId, documentUuid, 'count'],
    countFetcher,
    opts,
  )

  useSockets({
    event: 'experimentStatus',
    onMessage: (message: EventArgs<'experimentStatus'>) => {
      if (!message) return
      const { experiment: updatedExperiment } = message
      if (updatedExperiment.documentUuid !== documentUuid) return

      mutate(
        (prev) => {
          if (!prev) return prev
          const prevExperimentIdx = prev.findIndex(
            (exp) => exp.uuid === updatedExperiment.uuid,
          )

          if (prevExperimentIdx !== -1) {
            // Substitute the previous experiment with the updated one, without moving it in the array
            prev[prevExperimentIdx] = updatedExperiment
            return prev
          }

          if (page > 1) {
            // Do not add any new experiments if we are not on the first page
            return
          }

          return [updatedExperiment, ...prev]
        },
        {
          revalidate: false,
        },
      )
    },
  })

  const { execute: create, isPending: isCreating } = useLatitudeAction(
    createExperimentAction,
    {
      onSuccess: async ({ data: experiment }: { data: Experiment }) => {
        mutateCount((prev) => (prev ? prev + 1 : 1), {
          revalidate: false,
        })

        const experimentDto = {
          ...experiment,
          results: {
            passed: 0,
            failed: 0,
            errors: 0,
            totalScore: 0,
          },
        } as ExperimentDto

        if (page === 1) {
          mutate(
            (prev) => {
              const prevExperiment = prev?.find(
                (exp) => exp.uuid === experimentDto.uuid,
              )

              if (prevExperiment) {
                // this might happen due to race conditions with the experimentStatus websocket
                return prev
              }

              return [experimentDto, ...(prev ?? [])]
            },
            {
              revalidate: false,
            },
          )
        }

        toast({
          title: 'Experiment created successfully',
          description: `Experiment ${experiment.name} created successfully`,
        })

        opts?.onCreate?.(experimentDto)
        return experimentDto
      },
      onError: async (error) => {
        if (error?.err?.name === 'ZodError') return
        toast({
          title: 'Error creating experiment',
          description: error?.err?.message,
          variant: 'destructive',
        })
      },
    },
  )

  return {
    count,
    data,
    isLoading,
    create,
    isCreating,
  }
}
