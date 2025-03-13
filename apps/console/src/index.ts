import repl from 'node:repl'
import { database, dbUtils } from '@latitude-data/core/client'
import * as models from '@latitude-data/core/schema'
import { setupReplHistory } from './replHistory'
import * as loadModules from './replReload'

const env = process.env.NODE_ENV || 'development'
const redColor = (text: string) => `\x1b[31m${text}\x1b[0m`
const blueColor = (text: string) => `\x1b[34m${text}\x1b[0m`
const label =
  env === 'production'
    ? redColor(`latitude (${env})`)
    : blueColor(`latitude (${env})`)
const r = repl.start({
  prompt: `${label} `,
  breakEvalOnSigint: true,
  useColors: true,
})

// History in Repl enabled
setupReplHistory(r)

r.context.database = {
  ...dbUtils,
  ...models,
  db: database,
}

// Use this to load code
// Ex: mod = await loadModule('@latitude-data/core/data-migrations')
r.context.loadModule = loadModules.loadModule

// Reload TS code changed in the modules you're importing
r.context.reload = loadModules.reloadAllModules
