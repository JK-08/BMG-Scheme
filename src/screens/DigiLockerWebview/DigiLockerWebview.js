// screens/DigiLockerWebViewScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  BackHandler,
  Alert,
  TouchableOpacity,
} from "react-native";
import { WebView } from "react-native-webview";
import { useNavigation, useRoute } from "@react-navigation/native";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import theme from "../../utils/AppTheme";
import { digiLockerService } from "../../services/DigiLockerService";

const { COLORS, SIZES, FONTS } = theme;

const DigiLockerWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const webViewRef = useRef(null);

  const {
    verificationUrl,
    verificationId,
    aadhaarNumber,
    onVerificationComplete,
  } = route.params || {};

  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (webViewRef.current && currentUrl !== verificationUrl) {
          webViewRef.current.goBack();
          return true;
        }

      Alert.alert(
  "Exit Verification",
  "Are you sure you want to exit? Your verification progress may be lost.",
  [
    { text: "Cancel", style: "cancel" },
    {
      text: "Exit",
      style: "destructive",
      onPress: () => {
        // Navigate directly to UserRegisterForm
        navigation.replace("UserRegisterForm", {
          verificationCancelled: true,
          aadhaarNumber: aadhaarNumber,
          message: "Verification cancelled by user",
          allowManualEntry: true
        });
      }
    },
  ]
);
        return true;
      }
    );

    return () => backHandler.remove();
  }, [currentUrl, verificationUrl]);

const handleExitVerification = () => {
  // Navigate to UserRegisterForm even when cancelled
  navigation.replace("UserRegisterForm", {
    verificationCancelled: true,
    aadhaarNumber: aadhaarNumber,
    message: "Verification was cancelled",
    allowManualEntry: true
  });
};

  // Complete verification process
// Complete verification process
const completeVerification = async () => {
  setIsCheckingStatus(true);
  
  try {
    // Use the complete verification method that fetches document data
    const verificationResult = await digiLockerService.completeVerification(
      verificationId, 
      aadhaarNumber
    );
    
    console.log("Complete verification result:", verificationResult);
    
    // Pass result to callback if exists
    if (onVerificationComplete) {
      onVerificationComplete(verificationResult);
    }
    
    // Navigate to UserRegisterForm with verification data
    if (verificationResult.success) {
      navigation.replace("UserRegisterForm", {
        verificationData: verificationResult,
        aadhaarVerified: true,
        aadhaarNumber: verificationResult.idProofNo,
        // Pass any other relevant data
        ...route.params?.registerData // If you have additional registration data
      });
    } else {
      // If verification failed, still go to UserRegisterForm but with error status
      navigation.replace("UserRegisterForm", {
        verificationError: verificationResult.message,
        aadhaarNumber: aadhaarNumber,
        // User can retry or enter manually
        allowManualEntry: true
      });
    }
    
  } catch (error) {
    console.error("Verification completion error:", error);
    // On error, still navigate to UserRegisterForm
    navigation.replace("UserRegisterForm", {
      verificationError: "Verification failed. Please try again or enter manually.",
      aadhaarNumber: aadhaarNumber,
      allowManualEntry: true
    });
  } finally {
    setIsCheckingStatus(false);
    // Don't call navigation.goBack() anymore
  }
};

  // Check verification status
  const checkStatusAndComplete = async () => {
  Alert.alert(
  "Check Verification",
  "Have you completed the verification in DigiLocker?",
  [
    {
      text: "Not Yet",
      style: "cancel",
    },
    {
      text: "Yes, I Completed It",
      onPress: completeVerification,
    },
    {
      text: "Cancel Verification",
      onPress: () => {
        // Navigate to UserRegisterForm
        navigation.replace("UserRegisterForm", {
          verificationCancelled: true,
          aadhaarNumber: aadhaarNumber,
          message: "Verification cancelled",
          allowManualEntry: true
        });
      },
      style: "destructive",
    },
  ]
);
  };

  const handleNavigationStateChange = (navState) => {
    const url = navState.url;
    setCurrentUrl(url);
    setIsLoading(navState.loading);

    // Check if redirected to success URL (bmgjewellers.com)
    if (url && url.includes("bmgjewellers.com")) {
      console.log("Success redirect detected to bmgjewellers.com");
      // Wait 2 seconds then complete verification
      setTimeout(() => {
        completeVerification();
      }, 2000);
    }
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    Alert.alert(
      "Error Loading DigiLocker",
      "Failed to load DigiLocker. Please check your internet connection.",
      [{ text: "OK", onPress: handleExitVerification }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader
        title="DigiLocker Verification"
        subtitle="Complete your Aadhaar verification"
        showBackButton={true}
        onBackPress={checkStatusAndComplete}
        showActionButton={true}
        actionButtonText="Check Status"
        onActionPress={checkStatusAndComplete}
      />

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Complete the verification in DigiLocker. After completion, you'll be redirected back.
        </Text>
        <Text style={styles.verificationIdText}>
          Verification ID: {verificationId}
        </Text>
        {aadhaarNumber && (
          <Text style={styles.aadhaarText}>
            Aadhaar: {digiLockerService.formatAadhaarNumber(aadhaarNumber, true)}
          </Text>
        )}
      </View>

      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: verificationUrl }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        
        {isCheckingStatus && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              Fetching Aadhaar data...
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  infoContainer: {
    padding: SIZES.padding.md,
    backgroundColor: COLORS.primaryLight + "20",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.margin.xs,
  },
  verificationIdText: {
    ...FONTS.caption,
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "500",
  },
  aadhaarText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SIZES.margin.xs,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.md,
  },
});

export default DigiLockerWebViewScreen;