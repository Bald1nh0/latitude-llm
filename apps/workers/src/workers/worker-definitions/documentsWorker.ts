import { Queues } from '@latitude-data/core/queues/types'
import * as jobs from '@latitude-data/core/jobs/definitions'
import { createWorker } from '../utils/createWorker'
import { WORKER_CONNECTION_CONFIG } from '../utils/connectionConfig'

const jobMappings = {
  generateDocumentSuggestionJob: jobs.generateDocumentSuggestionJob,
  runDocumentForEvaluationJob: jobs.runDocumentForEvaluationJob,
  runDocumentInBatchJob: jobs.runDocumentInBatchJob,
  runDocumentJob: jobs.runDocumentJob,
}

export function startDocumentsWorker() {
  return createWorker(Queues.documentsQueue, jobMappings, {
    concurrency: 50,
    connection: WORKER_CONNECTION_CONFIG,
  })
}
