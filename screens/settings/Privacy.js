import React from 'react'
import { ScrollView, View } from 'react-native'

import { isWeb } from '@constants/layout'

import PapersContext from '@store/PapersContext.js'

import Page from '@components/page'
import { IconExternal } from '@components/icons'

import Item from './Item.js'
import { setSubHeader, propTypesCommon } from './utils'

import * as Theme from '@theme'

export default function Privacy({ navigation }) {
  // const Papers = React.useContext(PapersContext)
  // const { profile } = Papers.state
  // const settingsCrashReportEnabled = profile.settings.crashReport
  const [ads, setAds] = React.useState(false)

  React.useEffect(() => {
    setSubHeader(navigation, 'Privacy')
  }, [])

  function handleCustomAdsToggle() {
    setAds(fakeBool => !fakeBool)
  }

  // function handleSentryToggle() {
  //   Papers.updateProfileSettings('crashReport', !settingsCrashReportEnabled)
  // }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View style={Theme.u.cardEdge}>
            {isWeb ? null : (
              <>
                <Item
                  title="Show personalized ads"
                  switchValue={ads}
                  onPress={handleCustomAdsToggle}
                />
                {/* <Item
                  title="Share with developers"
                  description="Share anonymous crash reports and help us improve Papers"
                  switchValue={settingsCrashReportEnabled}
                  onPress={handleSentryToggle}
                /> */}
                <View style={Theme.u.listDivider} />
              </>
            )}

            <Item
              title="Privacy Policy"
              Icon={IconExternal}
              onPress={() => console.warn('TODO!! page!!')}
            />
            <Item
              title="Terms of Service"
              Icon={IconExternal}
              onPress={() => console.warn('TODO!! page!!')}
            />
            <Item
              title="User Agreement"
              Icon={IconExternal}
              onPress={() => console.warn('TODO!! page!!')}
            />

            <View style={Theme.u.listDivider} />
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

Privacy.propTypes = propTypesCommon
