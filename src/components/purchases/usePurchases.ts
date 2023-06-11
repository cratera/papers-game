import React from 'react'
import { Platform } from 'react-native'
import { useEffectOnce } from 'usehooks-ts'
import { getPurchaserType } from './purchases.service.js'
import { PurchaserType } from './purchases.types.js'

const isWeb = Platform.OS === 'web'

export default function usePurchases() {
  const [purchaserType, setPurchaserType] = React.useState<PurchaserType>()
  useEffectOnce(() => {
    async function getType() {
      const type = await getPurchaserType()
      setPurchaserType(type)
    }
    getType()
  })

  return {
    isPurchaserFree: !isWeb && purchaserType === 'FREE',
  }
}
