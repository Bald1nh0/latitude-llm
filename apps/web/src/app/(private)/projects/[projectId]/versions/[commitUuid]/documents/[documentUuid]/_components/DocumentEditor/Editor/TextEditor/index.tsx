import { requestSuggestionAction } from '$/actions/copilot/requestSuggestion'
import { publishEventAction } from '$/actions/events/publishEventAction'
import useLatitudeAction from '$/hooks/useLatitudeAction'
import { DocumentVersion } from '@latitude-data/core/browser'
import { ReactStateDispatch } from '@latitude-data/web-ui/commonTypes'
import { DocumentTextEditor } from '@latitude-data/web-ui/molecules/DocumentTextEditor'
import { TextEditorPlaceholder } from '@latitude-data/web-ui/molecules/TextEditorPlaceholder'
import {
  ICommitContextType,
  IProjectContextType,
} from '@latitude-data/web-ui/providers'
import type { DiffOptions } from 'node_modules/@latitude-data/web-ui/src/ds/molecules/DocumentTextEditor/types'
import { CompileError } from 'promptl-ai'
import { Suspense, useCallback } from 'react'
import { DocumentRefinement } from '../DocumentRefinement'
import { DocumentSuggestions } from '../DocumentSuggestions'

export function PlaygroundTextEditor({
  compileErrors,
  project,
  document,
  commit,
  onChange,
  setDiff,
  diff,
  value,
  copilotEnabled,
  isMerged,
  isSaved,
}: {
  compileErrors: CompileError[] | undefined
  project: IProjectContextType['project']
  commit: ICommitContextType['commit']
  document: DocumentVersion
  setDiff: ReactStateDispatch<DiffOptions | undefined>
  diff: DiffOptions | undefined
  copilotEnabled: boolean
  value: string
  isSaved: boolean
  isMerged: boolean
  onChange: (value: string) => void
}) {
  const { execute: publishEvent } = useLatitudeAction(publishEventAction)
  const {
    execute: executeRequestSuggestionAction,
    isPending: isCopilotLoading,
  } = useLatitudeAction(requestSuggestionAction, {
    onSuccess: ({
      data: suggestion,
    }: {
      data: { code: string; response: string } | null
    }) => {
      if (!suggestion) return

      setDiff({
        newValue: suggestion.code,
        description: suggestion.response,
        onAccept: (newValue: string) => {
          setDiff(undefined)
          publishEvent({
            eventType: 'copilotSuggestionApplied',
            payload: {
              projectId: project.id,
              commitUuid: commit.uuid,
              documentUuid: document.documentUuid,
            },
          })
          onChange(newValue)
        },
        onReject: () => {
          setDiff(undefined)
        },
      })
    },
  })
  const requestSuggestion = useCallback(
    (prompt: string) => {
      executeRequestSuggestionAction({
        projectId: project.id,
        commitUuid: commit.uuid,
        documentUuid: document.documentUuid,
        request: prompt,
      })
    },
    [executeRequestSuggestionAction],
  )

  return (
    <Suspense fallback={<TextEditorPlaceholder />}>
      <DocumentTextEditor
        autoFocus
        value={value}
        compileErrors={compileErrors}
        onChange={onChange}
        diff={diff}
        readOnlyMessage={
          isMerged ? 'Create a draft to edit documents.' : undefined
        }
        isSaved={isSaved}
        actionButtons={
          <>
            <DocumentSuggestions
              project={project}
              commit={commit}
              document={document}
              prompt={value}
              setDiff={setDiff}
              setPrompt={onChange}
            />
            <DocumentRefinement
              project={project}
              commit={commit}
              document={document}
              setDiff={setDiff}
              setPrompt={onChange}
              refinementEnabled={copilotEnabled}
            />
          </>
        }
        copilot={
          copilotEnabled
            ? {
                isLoading: isCopilotLoading,
                requestSuggestion,
                disabledMessage:
                  document.promptlVersion === 0
                    ? 'Copilot is disabled for prompts using the old syntax. Upgrade to use Copilot.'
                    : undefined,
              }
            : undefined
        }
      />
    </Suspense>
  )
}
