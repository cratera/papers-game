export const SENTRY_CONFIG = {
  dsn: 'https://9c47ca624c844cefa678401150395766@o409284.ingest.sentry.io/5281445',
  enableInExpoDevelopment: false,
  debug: false,
}

export const SCREEN_FADE = ({ current, closing }) => ({
  cardStyle: {
    opacity: current.progress,
  },
})
