import React from 'react'
import { Text } from 'react-native'
import Page from '@components/page'

import { setSubHeader, propTypesCommon } from './utils'

export default function Privacy({ navigation }) {
  React.useEffect(() => {
    setSubHeader(navigation, 'Privacy')
  }, [])

  return (
    <Page>
      <Page.Main headerDivider>
        <Text>Privacy on the way...</Text>
      </Page.Main>
    </Page>
  )
}

Privacy.propTypes = propTypesCommon
