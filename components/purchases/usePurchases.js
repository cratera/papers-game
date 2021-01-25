import React from 'react'
import { Platform } from 'react-native'
import { purchaserTypes, getPurchaserType } from './purchases.service.js'

const isWeb = Platform.OS === 'web'

export default function usePurchases() {
  const [purchaserType, setPurchaserType] = React.useState(null)
  React.useEffect(() => {
    async function getType() {
      const type = await getPurchaserType()
      setPurchaserType(type)
    }
    getType()
  }, [])

  return {
    isPurchaserFree: !isWeb && purchaserType === purchaserTypes.FREE,
  }
}
