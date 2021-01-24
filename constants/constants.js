export const SENTRY_CONFIG = {
  dsn: 'https://9c47ca624c844cefa678401150395766@o409284.ingest.sentry.io/5281445',
  // BUG LATER. For some unkwnown reason, Sentry does not work when OTA
  // With this flag, it works. But, that means, the code is still in "expo dev" mode.
  enableInExpoDevelopment: !__DEV__,
  debug: false,
}

export const SCREEN_FADE = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress,
  },
})
