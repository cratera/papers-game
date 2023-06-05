import { useCallback, useEffect, useState } from 'react'

type UseCountdownOptions = {
  intervalTime?: number
  timer?: number
}

const defaultOptions: UseCountdownOptions = {
  intervalTime: 1000,
  timer: 60000,
}

export default function useCountdown(
  initialDate: number,
  options: UseCountdownOptions = defaultOptions
) {
  const { intervalTime, timer } = options
  const [dateStarted, resetDateStarted] = useState(initialDate)

  const getTimeLeft = useCallback(
    (datePivot: number) => {
      const timeLeft = timer - (Date.now() - datePivot)
      return Math.max(0, timeLeft)
    },
    [timer]
  )

  const [timeLeft, setTimeLeft] = useState(getTimeLeft(dateStarted))

  function restartCountdown(newDate: number) {
    setTimeLeft(getTimeLeft(newDate))
    resetDateStarted(newDate)
  }

  useEffect(() => {
    const startedTimeLeft = getTimeLeft(dateStarted)
    if (startedTimeLeft === 0) {
      // useCountdown was called with a dateStarted already expired.
      // Probably will use restartCountdown later down the road.
      return
    }
    const interval = setInterval(() => {
      setTimeLeft(() => {
        const newTimeLeft = getTimeLeft(dateStarted)

        if (newTimeLeft <= 0) {
          clearInterval(interval)

          return 0
        }

        return newTimeLeft
      })
    }, intervalTime)

    return () => clearInterval(interval)
  }, [dateStarted, getTimeLeft, intervalTime])

  return [timeLeft, restartCountdown]
}
