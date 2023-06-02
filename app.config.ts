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
  scheme: 'myapp',
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
    config: {
      firebase: {
        apiKey: 'AIzaSyBYB6fczaHoB-SKjMRM4VHradIyLtluBHM',
        authDomain: 'papers-game.firebaseapp.com',
        databaseURL: 'https://papers-game.firebaseio.com',
        projectId: 'papers-game',
        storageBucket: 'papers-game.appspot.com',
        messagingSenderId: '381121722531',
        appId: '1:381121722531:web:5d88b1a0b418e4e8c8e716',
        measurementId: 'G-BFBZ4MNDX4',
      },
    },
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
  updates: {
    url: 'https://u.expo.dev/f071d04b-99d2-40f3-a7e6-734ef20b604e',
  },
  runtimeVersion: {
    policy: 'sdkVersion',
  },
}

export default config
