import { ReactNode } from 'react'

import { Container, TitleWithActions } from '@latitude-data/web-ui'
import buildMetatags from '$/app/_lib/buildMetatags'
import { AppTabs } from '$/app/(private)/AppTabs'

import Memberships from './_components/Memberships'
import ProviderApiKeys from './_components/ProviderApiKeys'
import WorkspaceApiKeys from './_components/WorkspaceApiKeys'
import WorkspaceName from './_components/WorkspaceName'
import Integrations from './_components/Integrations'

export const metadata = buildMetatags({
  title: 'Settings',
})

export default async function SettingsLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <Container>
      <AppTabs />
      {children}
      <TitleWithActions title='Workspace' />
      <WorkspaceName />
      <Memberships />
      <WorkspaceApiKeys />
      <ProviderApiKeys />
      <Integrations />
    </Container>
  )
}
