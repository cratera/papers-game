import React from 'react'
import * as Device from 'expo-device'

// !!!! ATTENTION !!!! //
// When changing this file, in dev mode, make sure to refresh the app.
// For some weird reason PapersContext gets lost returning state undefined
// (causing the bug at Lobby.js)

export function createUniqueId(name) {
  // Q: maybe this should be created on server instead.
  // prettier-ignore
  return `${name}_${Math.random().toString(36).substr(2, 9)}_${new Date().getTime()}`;
}

export function slugString(str) {
  // from https://gist.github.com/codeguy/6684588#gistcomment-2624012
  str = str.replace(/^\s+|\s+$/g, '-') // replace space by -
  str = str.toLowerCase()

  // remove accents, swap ñ for n, etc
  var from = 'àáãäâèéëêìíïîòóöôùúüûñç·/_,:;'
  var to = 'aaaaaeeeeiiiioooouuuunc------'

  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '') // collapse whitespace
    .replace(/-+/g, '') // collapse dashes

  return str
}

export function getRandomInt(max) {
  const min = 0
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function msToSecPretty(ms) {
  let minutes = Math.floor(ms / 60000)
  let seconds = ((ms % 60000) / 1000).toFixed(0)
  if (seconds === '60') {
    // eg: 00:60 -> 1:00
    seconds = '0'
    minutes++
  }
  return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}

// React Hook
export function usePrevious(value) {
  const ref = React.useRef()
  React.useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export function useCountdown(initialDate, options = {}) {
  const opts = {
    intervalTime: 1000,
    timer: 60000,
    ...options,
  }
  const [dateStarted, resetDateStarted] = React.useState(initialDate)
  const [timeLeft, setTimeLeft] = React.useState(getTimeLeft(dateStarted))
  const intervalTime = opts.intervalTime

  const getTimeLeftCb = React.useCallback(datePivot => getTimeLeft(datePivot), []) // eslint-disable-line

  function getTimeLeft(datePivot) {
    const timeLeft = opts.timer - (Date.now() - datePivot)
    return Math.max(0, timeLeft)
  }

  function restartCountdown(newDate) {
    setTimeLeft(getTimeLeft(newDate))
    resetDateStarted(newDate)
  }

  React.useEffect(() => {
    const startedTimeLeft = getTimeLeftCb(dateStarted)
    if (startedTimeLeft === 0) {
      // useCountdown was called with a dateStarted already expired.
      // Probably will use restartCountdown later in the road.
      return
    }
    const interval = setInterval(() => {
      setTimeLeft(() => {
        const newTimeLeft = getTimeLeftCb(dateStarted)

        if (newTimeLeft <= 0) {
          clearInterval(interval)

          return 0
        }

        return newTimeLeft
      })
    }, intervalTime)

    return () => clearInterval(interval)
  }, [dateStarted, getTimeLeftCb, intervalTime])

  return [timeLeft, restartCountdown]
}

export function confirmLeaveGame(fnToLeave) {
  console.log('hmmmm FORCE Refresh Bug on Lobby.js')
}

export function mailToFeedback(version) {
  // TODO!! before release.
  return {
    recipients: ['a.sandrina.p@gmail.com'],
    subject: 'Papers - Feedback',
    body:
      '\n' +
      '\n' +
      '\n' +
      '- - - - - - - - - - - - -' +
      '\n' +
      `V. ${version} - ${Device.osName} ${Device.modelName}` +
      '\n' +
      '- - - - - - - - - - - - -',
  }
}

export function mailToBug(version) {
  return {
    recipients: ['a.sandrina.p@gmail.com'],
    subject: 'Papers - Bug',
    body:
      '\n' +
      '\n' +
      '\n' +
      '- - - - - - - - - - - - -' +
      '\n' +
      `V. ${version} - ${Device.osName} ${Device.modelName}` +
      '\n' +
      '- - - - - - - - - - - - -',
  }
}

export function isDebugging(profileName) {
  return profileName === 'SandyBug'
}
