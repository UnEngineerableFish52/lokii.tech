export default {
  name: 'Global Students Association',
  slug: 'gsa-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  splash: {
    image: './assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0a0a0f'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.gsa.app'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0a0a0f'
    },
    package: 'com.gsa.app'
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro'
  },
  extra: {
    apiUrl: process.env.API_URL || 'http://localhost:3000/api',
    socketUrl: process.env.SOCKET_URL || 'http://localhost:3001'
  }
};
