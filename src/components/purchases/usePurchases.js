import { useEffectOnce } from '@src/hooks'
import React from 'react'
import { Platform } from 'react-native'
import { getPurchaserType, purchaserTypes } from './purchases.service.js'

const isWeb = Platform.OS === 'web'

export default function usePurchases() {
  const [purchaserType, setPurchaserType] = React.useState(null)
  useEffectOnce(() => {
    async function getType() {
      const type = await getPurchaserType()
      setPurchaserType(type)
    }
    getType()
  })

  return {
    isPurchaserFree: !isWeb && purchaserType === purchaserTypes.FREE,
  }
}
