import { User, Workspace } from '../../browser'
import { database } from '../../client'
import { Result } from '../../lib'
import { DatasetsV2Repository } from '../../repositories'
import { createDataset } from './create'

export async function findOrCreateDataset(
  {
    name,
    author,
    workspace,
  }: {
    name: string
    author: User
    workspace: Workspace
  },
  db = database,
) {
  const repo = new DatasetsV2Repository(workspace.id)
  const datasets = await repo.findByName(name)
  const dataset = datasets[0]
  if (dataset) return Result.ok(dataset)

  return createDataset(
    {
      author,
      workspace,
      data: { name, columns: [] },
    },
    db,
  )
}
