export const formatSlug = (str: string) => {
  // from https://gist.github.com/codeguy/6684588#gistcomment-2624012
  str = str.replace(/^\s+|\s+$/g, '-') // replace space by -
  str = str.toLowerCase()

  // remove accents, swap ñ for n, etc
  const from = 'àáãäâèéëêìíïîòóöôùúüûñç·/_,:;'
  const to = 'aaaaaeeeeiiiioooouuuunc------'

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '') // collapse whitespace
    .replace(/-+/g, '') // collapse dashes

  return str
}

export const convertMsToSec = (ms: number) => {
  let minutes = Math.floor(ms / 60000)
  let seconds = Number(((ms % 60000) / 1000).toFixed(0))

  if (seconds === 60) {
    // eg: 00:60 -> 1:00
    seconds = 0
    minutes++
  }
  return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}
