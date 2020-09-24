import React from 'react'

import Page from '@components/page'

import { setSubHeader, propTypesCommon } from './utils'
import AudioPreview from './AudioPreview.js'

export default function SettingsSound({ navigation }) {
  React.useEffect(() => {
    setSubHeader(navigation, 'Sound & Animations')
  }, [])

  return (
    <Page>
      <Page.Main headerDivider>
        <AudioPreview />
      </Page.Main>
    </Page>
  )
}
SettingsSound.propTypes = propTypesCommon
