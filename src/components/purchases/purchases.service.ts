import * as Sentry from '@src/services/sentry'
import { PurchaserType } from './purchases.types'

// TODO: implement purchases, react-native-purchases is no longer supported by Expo managed workflow
// import Purchases from 'react-native-purchases'

export async function getPurchaserType(): Promise<PurchaserType> {
  try {
    // const purchaserInfo = await Purchases.getPurchaserInfo()
    // console.log('purchaserInfo', purchaserInfo.entitlements.active)
    // if (purchaserInfo.entitlements.active?.member?.productIdentifier) {
    //   return purchaserTypes.MEMBER
    // }
    return 'FREE'
  } catch (e) {
    Sentry.captureException(e, { tags: { pp_action: 'PURC_T' } })
  }

  return 'FREE'
}
