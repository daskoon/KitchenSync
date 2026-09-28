import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kitchensync.wdyww',
  appName: 'KitchenSync',
  webDir: 'dist',
  android: {
    minSdkVersion: 21,
    targetSdkVersion: 33, // Match with AGP config
    release: {
      keystorePath: '../../upload-keystore.jks', // Relative to the project root
      keystorePassword: 'password123',
      keystoreAlias: 'key0',
      keystoreAliasPassword: 'password123'
    }
  }
};

export default config;
