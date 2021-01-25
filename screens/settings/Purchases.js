import React from 'react'
import { ScrollView, Text, View } from 'react-native'

import Purchases from 'react-native-purchases'

import * as Theme from '@theme'

import Sentry from '@constants/Sentry'
import Page from '@components/page'

import Button from '@components/button'
import { getPurchaserType } from '@components/purchases/purchases.service.js'

import { useSubHeader, propTypesCommon } from './utils'

const syncTypes = {
  PAYING: 'paying',
  RESTORING: 'restoring',
  FORGETTING: 'forgetting',
}

const packageAds = 'papers_109_remove_ads01'

export default function PurchasesView({ navigation }) {
  const [userType, setUserType] = React.useState(null)
  const [offerings, setOfferings] = React.useState('loading')
  const [syncingType, setSyncingType] = React.useState(false)

  useSubHeader(navigation, 'Papers Extras')

  React.useEffect(() => {
    loadPurchases()
  }, [])

  async function loadPurchases() {
    try {
      const offerings = await Purchases.getOfferings()
      if (offerings.current !== null) {
        setOfferings(offerings.current)
      }
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_0' } })
    }

    const purchaserType = await getPurchaserType()
    setUserType(purchaserType)
  }

  async function handlePayClick() {
    const packageRemoveAds = offerings.availablePackages[0]
    console.log('to pay:', packageRemoveAds)
    setSyncingType(syncTypes.PAYING)

    try {
      const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(packageRemoveAds)
      if (purchaserInfo.entitlements.active.member.productIdentifier === packageAds) {
        console.log('PAYED!!!', productIdentifier)
        loadPurchases()
      }
    } catch (e) {
      if (e.userCancelled) {
        console.log('User cancelled')
      } else {
        Sentry.captureException(e, { tags: { pp_action: 'PAY_P' } })
      }
    } finally {
      setSyncingType(null)
    }
  }

  async function handleRestoreClick() {
    setSyncingType(syncTypes.RESTORING)

    try {
      await Purchases.restoreTransactions()
      loadPurchases()
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_R' } })
    } finally {
      setSyncingType(null)
    }
  }

  async function handleForgetClick() {
    setSyncingType(syncTypes.FORGETTING)

    try {
      await Purchases.identify(Date.now().toString())
      loadPurchases()
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_F' } })
    } finally {
      setSyncingType(null)
    }
  }

  return (
    <Page>
      <Page.Main headerDivider>
        <ScrollView style={[Theme.u.scrollSideOffset]}>
          <View>
            <Text>{'\n'}</Text>
            <Text>User Type: {userType}</Text>
            <Text>{'\n'}</Text>

            {userType === 'FREE' && (
              <>
                <Button
                  variant="light"
                  onPress={handlePayClick}
                  isLoading={syncingType === syncTypes.PAYING}
                >
                  Remove ads
                </Button>
                <Text>{'\n'}</Text>

                <Button
                  variant="light"
                  onPress={handleRestoreClick}
                  isLoading={syncingType === syncTypes.RESTORING}
                >
                  Restore purchases
                </Button>
              </>
            )}

            {userType === 'MEMBER' && (
              <>
                <Text style={Theme.typography.h3}>You have Papers Pro!</Text>
                <Text style={Theme.typography.body}>
                  Go to Experimental page. The ads disappeared.
                </Text>
                <Text>{'\n'}</Text>

                <Text>{'\n'}</Text>

                <Button
                  variant="light"
                  onPress={handleForgetClick}
                  isLoading={syncingType === syncTypes.FORGETTING}
                >
                  (debug) Forget purchases
                </Button>
              </>
            )}
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

PurchasesView.propTypes = propTypesCommon
