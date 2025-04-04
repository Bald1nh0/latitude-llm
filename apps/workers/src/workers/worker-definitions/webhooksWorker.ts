import { Queues } from '@latitude-data/core/queues/types'
import * as jobs from '@latitude-data/core/jobs/definitions'
import { createWorker } from '../utils/createWorker'

const jobMappings = {
  processWebhookJob: jobs.processWebhookJob,
  processIndividualWebhookJob: jobs.processIndividualWebhookJob,
}

export function startWebhooksWorker() {
  return createWorker(Queues.webhooksQueue, jobMappings)
}
