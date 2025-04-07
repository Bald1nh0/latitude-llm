'use client'

import { ROUTES } from '$/services/routes'
import { Commit, DocumentVersion, Project } from '@latitude-data/core/browser'
import {
  AppLocalStorage,
  useLocalStorage,
} from '@latitude-data/web-ui/hooks/useLocalStorage'
import { omit } from 'lodash-es'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

export enum PlaygroundAction {
  RefinePrompt = 'refinePrompt',
}

export type PlaygroundActionPayload = {
  [PlaygroundAction.RefinePrompt]:
    | {
        evaluationId: number
        resultIds: number[]
        version: 'v1'
      }
    | {
        evaluationUuid: string
        resultUuids: string[]
        version: 'v2'
      }
}

type playgroundAction<A extends PlaygroundAction> = {
  action: A
  payload: PlaygroundActionPayload[A]
  projectId: number
  commitUuid: string
  documentUuid: string
}
type PlaygroundActions = { [key: string]: playgroundAction<PlaygroundAction> }

export function usePlaygroundAction<A extends PlaygroundAction>({
  action: actionType,
  project,
  commit,
  document,
}: {
  action: A
  project: Pick<Project, 'id'>
  commit: Pick<Commit, 'uuid'>
  document: Pick<DocumentVersion, 'commitId' | 'documentUuid'>
}) {
  const navigate = useRouter()
  const route = ROUTES.projects
    .detail({ id: project.id })
    .commits.detail({ uuid: commit.uuid })
    .documents.detail({ uuid: document.documentUuid }).root

  const { value: playgroundActions, setValue: setPlaygroundActions } =
    useLocalStorage<PlaygroundActions>({
      key: AppLocalStorage.playgroundActions,
      defaultValue: {},
    })

  const actionId = useSearchParams().get('actionId')
  const [action, setAction] = useState<PlaygroundActionPayload[A] | undefined>(
    actionId &&
      playgroundActions[actionId]?.action === actionType &&
      playgroundActions[actionId]?.projectId === project.id &&
      playgroundActions[actionId]?.commitUuid === commit.uuid &&
      playgroundActions[actionId]?.documentUuid === document.documentUuid
      ? playgroundActions[actionId]!.payload
      : undefined,
  )

  const setPlaygroundAction = useCallback(
    (payload: PlaygroundActionPayload[A]) => {
      const actionId = Math.random().toString(36).substring(2, 10)
      setPlaygroundActions({
        ...playgroundActions,
        [actionId]: {
          action: actionType,
          payload: payload,
          projectId: project.id,
          commitUuid: commit.uuid,
          documentUuid: document.documentUuid,
        },
      })
      const query = new URLSearchParams({ actionId })
      navigate.push(`${route}?${query.toString()}`)
    },
    [
      playgroundActions,
      setPlaygroundActions,
      actionType,
      project,
      commit,
      document,
      navigate,
      route,
    ],
  )

  const resetPlaygroundAction = useCallback(() => {
    const clean = !!action && !!actionId
    setAction(undefined)
    if (clean) setPlaygroundActions(omit(playgroundActions, actionId))
    navigate.replace(route)
  }, [
    action,
    actionId,
    setAction,
    playgroundActions,
    setPlaygroundActions,
    navigate,
    route,
  ])

  return {
    playgroundAction: action,
    setPlaygroundAction,
    resetPlaygroundAction,
  }
}
