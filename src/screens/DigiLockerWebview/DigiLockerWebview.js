import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DigiLockerWebViewScreen({ route, navigation }) {
  const { url, verificationId } = route.params;
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [title, setTitle] = useState("DigiLocker");
  const [hasNavigatedBack, setHasNavigatedBack] = useState(false);

  // Create a ref for the WebView
  const webViewRef = useRef(null);

  // Extract verification ID from URL
  const extractVerificationIdFromUrl = (url) => {
    try {
      console.log("🔍 Extracting verification ID from URL:", url);

      // Parse URL
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      // Try different possible parameter names
      const verificationId =
        params.get('verification_id') ||
        params.get('verificationId') ||
        params.get('verification-id') ||
        params.get('vid') ||
        params.get('id');

      console.log("🔍 Found verification ID:", verificationId);
      return verificationId;
    } catch (error) {
      console.error("❌ Error parsing URL:", error);

      // Fallback: try regex extraction
      const regex = /[?&](?:verification[_-]?id|vid|id)=([^&]+)/i;
      const match = url.match(regex);
      if (match) {
        console.log("🔍 Found verification ID via regex:", match[1]);
        return decodeURIComponent(match[1]);
      }

      return null;
    }
  };

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      } else {
        if (!hasNavigatedBack) {
          setHasNavigatedBack(true);
          // Pass verification status back
          navigation.navigate("AddNewMember", {
            screen: "MemberDetailsPage",
            params: {
              verificationId: verificationId,
              verificationInitiated: true,
            }
          });
        }
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      backHandler.remove();
    };
  }, [navigation, verificationId, canGoBack, hasNavigatedBack]);

  // Detect callback URLs more robustly
  const handleNavigationStateChange = useCallback((navState) => {
    setLoading(navState.loading);
    setCanGoBack(navState.canGoBack);
    setTitle(navState.title || "DigiLocker Verification");

    const currentUrl = navState.url || "";
    console.log("Current URL:", currentUrl);

    // More comprehensive callback URL detection
    const isSuccessCallback =
      currentUrl.includes("bmgjewellers.com") ||
      currentUrl.includes("success") ||
      currentUrl.includes("callback?code=") ||
      currentUrl.includes("digilocker.gov.in/callback") ||
      currentUrl.includes("verification_complete") ||
      currentUrl.includes("status=success");

    const isErrorCallback =
      currentUrl.includes("error") ||
      currentUrl.includes("failed") ||
      currentUrl.includes("denied") ||
      currentUrl.includes("cancelled");

    if (isSuccessCallback && !hasNavigatedBack) {
      console.log("✅ Success callback detected:", currentUrl);

      // Extract verification ID from URL
      let extractedVerificationId = extractVerificationIdFromUrl(currentUrl);
      console.log("✅ Extracted verification ID:", extractedVerificationId);

      // If no verification ID found in URL, use the one from params
      if (!extractedVerificationId) {
        console.log("⚠️ No verification ID in URL, using param:", verificationId);
        extractedVerificationId = verificationId;
      }

      setHasNavigatedBack(true);

      // IMPORTANT: Save to AsyncStorage immediately before navigating
      const saveAndNavigate = async () => {
        try {
          console.log("💾 Saving verification ID to storage:", extractedVerificationId);
          await AsyncStorage.multiSet([
            ["aadhaarVerificationId", extractedVerificationId],
            ["aadhaarVerificationStatus", "pending"],
          ]);

          console.log("✅ Saved to storage, navigating back...");
          // Navigate back to AddNewMember (which hosts MemberDetailsPage)
          navigation.navigate("AddNewMember", {
            screen: "MemberDetailsPage",
            params: {
              verificationId: extractedVerificationId,
              verificationCompleted: true,
              timestamp: Date.now(),
            }
          });
        } catch (error) {
          console.error("❌ Error saving to storage:", error);
          // Still navigate even if save fails
          navigation.navigate("AddNewMember", {
            screen: "MemberDetailsPage",
            params: {
              verificationId: extractedVerificationId,
              verificationCompleted: true,
              timestamp: Date.now(),
            }
          });
        }
      };

      saveAndNavigate();

    } else if (isErrorCallback && !hasNavigatedBack) {
      console.log("❌ Error callback detected:", currentUrl);

      // Extract verification ID from URL if available
      const extractedVerificationId = extractVerificationIdFromUrl(currentUrl);

      setHasNavigatedBack(true);
      Alert.alert(
        "Verification Cancelled",
        "Aadhaar verification was cancelled or failed. Please try again.",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("AddNewMember", {
                screen: "MemberDetailsPage",
                params: {
                  verificationId: extractedVerificationId || verificationId,
                  verificationFailed: true,
                }
              });
            }
          }
        ]
      );
    }
  }, [navigation, verificationId, hasNavigatedBack]);

  const handleLoadProgress = ({ nativeEvent }) => {
    setProgress(nativeEvent.progress);
  };

  const handleLoadStart = () => {
    setLoading(true);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = useCallback((syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);

    // Check for specific error types
    const errorMessage = nativeEvent.description || "Unknown error";

    if (errorMessage.includes("net::ERR_INTERNET_DISCONNECTED") ||
      errorMessage.includes("net::ERR_CONNECTION_REFUSED")) {
      Alert.alert(
        "Connection Error",
        "Unable to connect to DigiLocker. Please check your internet connection and try again.",
        [
          {
            text: "Go Back",
            onPress: () => {
              navigation.navigate("AddNewMember", {
                screen: "MemberDetailsPage",
                params: {
                  verificationId: verificationId,
                  verificationFailed: true,
                }
              });
            }
          },
          {
            text: "Retry",
            onPress: () => {
              webViewRef.current?.reload();
            }
          }
        ]
      );
    } else {
      Alert.alert(
        "Error Loading Page",
        "There was an issue loading the DigiLocker page. Please try again.",
        [
          {
            text: "Go Back",
            onPress: () => {
              navigation.navigate("AddNewMember", {
                screen: "MemberDetailsPage",
                params: {
                  verificationId: verificationId,
                  verificationFailed: true,
                }
              });
            }
          }
        ]
      );
    }
  }, [navigation, verificationId]);

  const injectJavaScript = `
    // Inject JavaScript to help with callback detection and verification ID extraction
    (function() {
      // Send current URL to React Native when page loads
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'PAGE_LOADED',
        url: window.location.href,
        title: document.title
      }));
      
      // Monitor for DigiLocker completion
      window.addEventListener('message', function(event) {
        console.log('Message received in WebView:', event.data);
        if (event.data && event.data.type === 'DIGILOCKER_COMPLETE') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DIGILOCKER_COMPLETE',
            data: event.data
          }));
        }
      });
      
      // Also check URL parameters on load
      var urlParams = new URLSearchParams(window.location.search);
      var verificationId = urlParams.get('verification_id');
      if (verificationId) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'VERIFICATION_ID_FOUND',
          verificationId: verificationId
        }));
      }
    })();
  `;

  const handleMessage = (event) => {
    // Handle messages from the WebView
    const data = event.nativeEvent.data;
    try {
      const parsedData = JSON.parse(data);
      console.log("Message from WebView:", parsedData);

      if (parsedData.type === 'VERIFICATION_ID_FOUND' && !hasNavigatedBack) {
        console.log("Verification ID found via JavaScript:", parsedData.verificationId);
        setHasNavigatedBack(true);
        setTimeout(() => {
          navigation.navigate("AddNewMember", {
            screen: "MemberDetailsPage",
            params: {
              verificationId: parsedData.verificationId,
              verificationCompleted: true,
            }
          });
        }, 500);
      }
    } catch (e) {
      console.log("Raw message from WebView:", data);
    }
  };

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    } else {
      if (!hasNavigatedBack) {
        setHasNavigatedBack(true);
        Alert.alert(
          "Exit Verification",
          "Are you sure you want to exit DigiLocker verification?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Exit",
              onPress: () => {
                navigation.navigate("AddNewMember", {
                  screen: "MemberDetailsPage",
                  params: {
                    verificationId: verificationId,
                    verificationInitiated: true,
                  }
                });
              }
            }
          ]
        );
      }
    }
  };

  const handleReload = () => {
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Reload button */}
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={handleReload}
        >
          <MaterialIcons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      {loading && (
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${progress * 100}%` }
            ]}
          />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        startInLoadingState={true}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadProgress={handleLoadProgress}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        injectedJavaScript={injectJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        allowsBackForwardNavigationGestures={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        thirdPartyCookiesEnabled={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              Loading DigiLocker...
            </Text>
          </View>
        )}
        renderError={(errorDomain, errorCode, errorDesc) => (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={64} color="#FF3B30" />
            <Text style={styles.errorTitle}>Unable to Load</Text>
            <Text style={styles.errorDescription}>
              {errorDesc || "Please check your internet connection"}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => webViewRef.current?.reload()}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Complete verification in DigiLocker to continue
        </Text>
        <Text style={styles.footerNote}>
          You will be redirected back after successful verification
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  reloadButton: {
    padding: 4,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#e0e0e0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  footerNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});