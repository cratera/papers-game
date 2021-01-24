import React from 'react'
import { ScrollView, Text, View } from 'react-native'

import Purchases from 'react-native-purchases'

import Sentry from '@constants/Sentry'
import Page from '@components/page'

import Button from '@components/button'
import { useSubHeader, propTypesCommon } from './utils'

import * as Theme from '@theme'

export default function PurchasesView({ navigation }) {
  const [userType, setUserType] = React.useState(null)
  const [offerings, setOfferings] = React.useState('loading')
  const [isPaying, setIsPaying] = React.useState(false)
  const [isRestoring, setIsRestoring] = React.useState(false)

  useSubHeader(navigation, 'Papers Extras')

  async function loadPurchases() {
    try {
      // Available packs
      const offerings = await Purchases.getOfferings()
      if (offerings.current !== null) {
        setOfferings(offerings.current)
      }

      // User purchases
      const purchaserInfo = await Purchases.getPurchaserInfo()
      if (purchaserInfo?.entitlements?.active?.member?.productIdentifier) {
        setUserType('MEMBER')
      } else {
        console.log(':: purchase-info', 'User Free')
        setUserType('FREE')
      }
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_0' } })
    }
  }

  React.useEffect(() => {
    loadPurchases()
  }, [])

  async function handlePayClick() {
    const packageRemoveAds = offerings.availablePackages[0]
    console.log('to pay:', packageRemoveAds)
    setIsPaying(true)
    try {
      const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(packageRemoveAds)
      if (typeof purchaserInfo.entitlements.member?.['papers_109_remove_ads01'] !== 'undefined') {
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
      setIsPaying(false)
    }
  }

  async function handleRestoreClick() {
    setIsRestoring(true)

    try {
      await Purchases.restoreTransactions()
      loadPurchases()
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_R' } })
    } finally {
      setIsRestoring(false)
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
                <Button variant="light" onPress={handlePayClick} isLoading={isPaying}>
                  Remove ads
                </Button>
                <Text>{'\n'}</Text>

                <Button variant="light" onPress={handleRestoreClick} isLoading={isRestoring}>
                  Restore purchases
                </Button>
              </>
            )}

            {userType === 'MEMBER' && <Text style={Theme.typography.h3}>You have Papers Pro!</Text>}
          </View>
        </ScrollView>
      </Page.Main>
    </Page>
  )
}

PurchasesView.propTypes = propTypesCommon
