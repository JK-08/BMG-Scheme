const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withFirebaseNotificationChannel(config) {
  return withAndroidManifest(config, (mod) => {
    const application = mod.modResults.manifest.application[0];
    const metaData = application['meta-data'] || [];

    // Fix default_notification_color conflict
    const colorEntry = metaData.find(
      (m) => m.$['android:name'] === 'com.google.firebase.messaging.default_notification_color'
    );
    if (colorEntry) {
      colorEntry.$['tools:replace'] = 'android:resource';
    }

    // Fix default_notification_channel_id conflict
    const channelEntry = metaData.find(
      (m) => m.$['android:name'] === 'com.google.firebase.messaging.default_notification_channel_id'
    );
    if (channelEntry) {
      channelEntry.$['tools:replace'] = 'android:value';
    }

    // Ensure xmlns:tools is declared on manifest root
    mod.modResults.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';

    return mod;
  });
};
