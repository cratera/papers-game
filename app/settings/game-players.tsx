import { Stack, useRouter } from 'expo-router'
import { ScrollView } from 'react-native'

import ListTeams from '@src/components/list-teams'
import Page from '@src/components/page'
import headerTheme from '@src/navigation/headerTheme'
import * as Theme from '@src/theme'

export default function GamePlayersSettings() {
  const router = useRouter()

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme(),
          headerTitle: 'Players',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />

      <Page.Main style={Theme.spacing.pt_16}>
        <ScrollView>
          <ListTeams enableKickout />
        </ScrollView>
      </Page.Main>
    </Page>
  )
}
