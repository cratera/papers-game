import * as Sentry from '@src/services/sentry'

// TODO: implement purchases, react-native-purchases is no longer supported by Expo managed workflow
// import Purchases from 'react-native-purchases'

export const purchaserTypes = {
  FREE: 'FREE',
  MEMBER: 'MEMBER',
}

export async function getPurchaserType() {
  try {
    // const purchaserInfo = await Purchases.getPurchaserInfo()
    // console.log('purchaserInfo', purchaserInfo.entitlements.active)
    // if (purchaserInfo.entitlements.active?.member?.productIdentifier) {
    //   return purchaserTypes.MEMBER
    // }
    return purchaserTypes.FREE
  } catch (e) {
    Sentry.captureException(e, { tags: { pp_action: 'PURC_T' } })
  }
}
