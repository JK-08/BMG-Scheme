import * as Application from "expo-application";

// Fetch Play Store HTML page and extract latest version
const fetchPlayStoreVersion = async (packageName) => {
  try {
    const url = `https://play.google.com/store/apps/details?id=${packageName}&hl=en`;

    const response = await fetch(url);
    const html = await response.text();

    // Extract version (Google Play uses "Current Version")
    const versionMatch = html.match(/Current Version<\/div><span.*?>(.*?)<\/span>/);

    if (versionMatch && versionMatch[1]) {
      return versionMatch[1].trim();
    }

    return null;
  } catch (error) {
    console.log("Play Store fetch error:", error);
    return null;
  }
};

// Compare version numbers
const compareVersions = (store, local) => {
  const a = store.split(".").map(Number);
  const b = local.split(".").map(Number);

  for (let i = 0; i < a.length; i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
};

export const checkForUpdate = async (packageName) => {
  try {
    const localVersion = Application.nativeApplicationVersion;
    const storeVersion = await fetchPlayStoreVersion(packageName);

    if (!storeVersion) {
      return { isUpdateAvailable: false };
    }

    const isUpdateAvailable = compareVersions(storeVersion, localVersion);

    return {
      isUpdateAvailable,
      storeVersion,
      localVersion,
    };
  } catch (error) {
    console.log("Version check error:", error);
    return { isUpdateAvailable: false };
  }
};
