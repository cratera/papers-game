import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useEffectOnce } from 'usehooks-ts'

// TODO: react-native-purchases is no longer supported by Expo managed workflow, find alternative
// import Purchases from 'react-native-purchases'

import Button from '@src/components/button'
import Page from '@src/components/page'
import { getPurchaserType } from '@src/components/purchases/purchases.service'
import { PurchaserType } from '@src/components/purchases/purchases.types'
import headerTheme from '@src/navigation/headerTheme'
import * as Sentry from '@src/services/sentry'
import * as Theme from '@src/theme'

const syncTypes = {
  PAYING: 'paying',
  RESTORING: 'restoring',
  FORGETTING: 'forgetting',
}

type SyncType = 'paying' | 'restoring' | 'forgetting' | 'idle'

// const packageAds = 'papers_109_remove_ads01'

export default function Purchases() {
  const [userType, setUserType] = useState<PurchaserType | null>(null)
  // const [offerings, setOfferings] = useState('loading')
  const [syncingType, setSyncingType] = useState<SyncType>('idle')
  const router = useRouter()

  useEffectOnce(() => {
    loadPurchases()
  })

  async function loadPurchases() {
    try {
      // const offerings = await Purchases.getOfferings()
      // if (offerings.current !== null) {
      //   setOfferings(offerings.current)
      // }
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_0' } })
    }

    const purchaserType = await getPurchaserType()
    setUserType(purchaserType)
  }

  async function handlePayClick() {
    // const packageRemoveAds = offerings.availablePackages[0]
    // console.log('to pay:', packageRemoveAds)
    setSyncingType('paying')

    try {
      // const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(packageRemoveAds)
      // if (purchaserInfo.entitlements.active.member.productIdentifier === packageAds) {
      //   console.log('PAYED!!!', productIdentifier)
      //   loadPurchases()
      // }
    } catch (e) {
      // if (e.userCancelled) {
      //   console.log('User cancelled')
      // } else {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_P' } })
      // }
    } finally {
      setSyncingType('idle')
    }
  }

  async function handleRestoreClick() {
    setSyncingType('restoring')

    try {
      // await Purchases.restoreTransactions()
      loadPurchases()
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_R' } })
    } finally {
      setSyncingType('idle')
    }
  }

  async function handleForgetClick() {
    setSyncingType('forgetting')

    try {
      // await Purchases.identify(Date.now().toString())
      loadPurchases()
    } catch (e) {
      Sentry.captureException(e, { tags: { pp_action: 'PAY_F' } })
    } finally {
      setSyncingType('idle')
    }
  }

  return (
    <Page>
      <Stack.Screen
        options={{
          ...headerTheme(),
          headerTitle: 'Papers extras',
          headerLeft: () => (
            <Page.HeaderBtn side="left" onPress={() => router.push('/settings')}>
              Back
            </Page.HeaderBtn>
          ),
        }}
      />

      <Page.Main>
        <ScrollView style={Theme.utils.scrollSideOffset}>
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
