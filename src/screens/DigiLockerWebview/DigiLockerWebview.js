import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";

export default function DigiLockerWebViewScreen({ route, navigation }) {
  const { url, verificationId } = route.params;
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasNavigatedBack, setHasNavigatedBack] = useState(false);
  
  // Create a ref for the WebView
  const webViewRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      if (!hasNavigatedBack) {
        setHasNavigatedBack(true);
        // Pass verification status back
        navigation.navigate("MemberDetailsPage", {
          verificationId,
          verificationInitiated: true,
        });
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      backHandler.remove();
    };
  }, [navigation, verificationId, hasNavigatedBack]);

  const handleNavigationStateChange = (navState) => {
    setLoading(navState.loading);
    
    // Check for various callback URLs
    const isCallbackUrl = 
      navState.url.includes("bmgjewellers.com") ||
      navState.url.includes("digilocker.gov.in/callback") ||
      navState.url.includes("success") ||
      navState.url.includes("error");

    if (isCallbackUrl && !hasNavigatedBack) {
      setHasNavigatedBack(true);
      // Small delay to ensure callback is processed
      setTimeout(() => {
        navigation.navigate("MemberDetailsPage", {
          verificationId,
          verificationCompleted: true,
        });
      }, 1000);
    }
  };

  const handleLoadProgress = ({ nativeEvent }) => {
    setProgress(nativeEvent.progress);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    Alert.alert(
      "Connection Error",
      "Unable to connect to DigiLocker. Please check your internet connection.",
      [
        {
          text: "Go Back",
          onPress: () => navigation.navigate("MemberDetailsPage", { verificationId })
        },
        {
          text: "Retry",
          onPress: () => webViewRef.current?.reload()
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.navigate("MemberDetailsPage", {
              verificationId,
              verificationInitiated: true,
            });
          }}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>DigiLocker Verification</Text>
        <View style={styles.headerRight} />
      </View>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        startInLoadingState={true}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadProgress={handleLoadProgress}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>
              Connecting to DigiLocker...
            </Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Complete verification in DigiLocker to continue
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 60, // For balance
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});