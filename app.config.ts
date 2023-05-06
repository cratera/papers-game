import { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  version: '0.0.0',
  name: 'Papers - The Game',
  slug: 'papers-game',
  description: 'The perfect game for your game night with friends or family!',
  privacy: 'public',
  platforms: ['ios', 'android', 'web'],
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/icon.png',
      backgroundColor: '#ffffff',
    },
  },
  web: {
    favicon: './assets/images/icon.png',
  },
  owner: 'papers',
  extra: {
    eas: {
      projectId: 'f3247b54-01c0-4013-9388-e3706870bdbd',
    },
  },
}

export default config
