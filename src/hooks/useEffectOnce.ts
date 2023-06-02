import { EffectCallback, useEffect } from 'react'

/**
 * Run useEffect only once.
 */
export default function useEffectOnce(effect: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [])
}
