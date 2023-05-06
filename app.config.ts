import { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  version: '0.0.0',
  owner: 'cratera',
  slug: 'papers-game',
  name: 'Papers - The Game',
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
  extra: {
    eas: {
      projectId: 'f071d04b-99d2-40f3-a7e6-734ef20b604e',
    },
  },
  plugins: ['sentry-expo'],
  hooks: {
    postPublish: [
      {
        file: 'sentry-expo/upload-sourcemaps',
        config: {
          organization: 'sandrina-pereira',
          project: 'papers-game',
        },
      },
    ],
  },
}

export default config
