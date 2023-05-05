import { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'Papers',
  slug: 'papers',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './assets/favicon.png',
  },
  owner: 'papers',
  extra: {
    eas: {
      projectId: 'f3247b54-01c0-4013-9388-e3706870bdbd',
    },
  },
}

export default config
