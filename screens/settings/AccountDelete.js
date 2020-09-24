import React from 'react'
import { Text } from 'react-native'
import Page from '@components/page'

import { setSubHeader, propTypesCommon } from './utils'

export default function Privacy({ navigation }) {
  React.useEffect(() => {
    setSubHeader(navigation, 'Delete account')
  }, [])

  return (
    <Page>
      <Page.Main headerDivider>
        <Text>Account delete on the way...</Text>
      </Page.Main>
    </Page>
  )
}

Privacy.propTypes = propTypesCommon
