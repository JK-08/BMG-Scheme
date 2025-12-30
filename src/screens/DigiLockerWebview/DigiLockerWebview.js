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
    userId, // Add userId from params
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
              onPress: () => handleExitVerification(),
            },
          ]
        );
        return true;
      }
    );

    return () => backHandler.remove();
  }, [currentUrl, verificationUrl]);

  const handleExitVerification = () => {
    // Navigate back to UserRegisterForm with cancellation status
    navigation.replace("UserRegisterForm", {
      verificationCancelled: true,
      aadhaarNumber: aadhaarNumber,
      message: "Verification cancelled by user",
      allowManualEntry: true,
      userId: userId, // Pass userId back
    });
  };

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
      
      // Navigate back to UserRegisterForm with verification data
      if (verificationResult.success && verificationResult.aadhaarVerified) {
        // Format date of birth from DD-MM-YYYY to YYYY-MM-DD
        const formatDOB = (dobString) => {
          if (!dobString) return '';
          if (dobString.includes('-')) {
            const parts = dobString.split('-');
            if (parts.length === 3) {
              return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }
          return dobString;
        };
        
        // Extract data for auto-fill
        const aadhaarData = verificationResult.userDetails || {};
        const documentData = verificationResult.documentData || {};
        
        navigation.replace("UserRegisterForm", {
          verificationData: verificationResult,
          aadhaarVerified: true,
          aadhaarNumber: verificationResult.idProofNo,
          maskedAadhaar: verificationResult.maskedAadhaar || digiLockerService.formatAadhaarNumber(verificationResult.idProofNo, true),
          aadhaarVerificationId: verificationResult.aadhaarVerificationId,
          aadhaarVerifiedAt: verificationResult.aadhaarVerifiedAt,
          aadhaarStatus: verificationResult.aadhaarStatus || 'VERIFIED',
          kycVerified: false, // Will be computed based on terms acceptance
          
          // Auto-fill data
          username: aadhaarData.name || '',
          dateOfBirth: formatDOB(aadhaarData.dob) || '',
          gender: aadhaarData.gender || '',
          address1: aadhaarData.address || '',
          
          userId: userId, // Pass userId back
        });
      } else {
        // Verification failed
        navigation.replace("UserRegisterForm", {
          verificationError: verificationResult.message || "Verification failed",
          aadhaarNumber: aadhaarNumber,
          allowManualEntry: true,
          userId: userId, // Pass userId back
        });
      }
      
    } catch (error) {
      console.error("Verification completion error:", error);
      // On error, navigate back to UserRegisterForm
      navigation.replace("UserRegisterForm", {
        verificationError: "Verification failed. Please try again or enter manually.",
        aadhaarNumber: aadhaarNumber,
        allowManualEntry: true,
        userId: userId, // Pass userId back
      });
    } finally {
      setIsCheckingStatus(false);
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
            // Navigate to UserRegisterForm with cancellation
            navigation.replace("UserRegisterForm", {
              verificationCancelled: true,
              aadhaarNumber: aadhaarNumber,
              message: "Verification cancelled",
              allowManualEntry: true,
              userId: userId, // Pass userId back
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
      [{ 
        text: "OK", 
        onPress: () => {
          navigation.replace("UserRegisterForm", {
            verificationError: "Failed to load DigiLocker",
            aadhaarNumber: aadhaarNumber,
            allowManualEntry: true,
            userId: userId, // Pass userId back
          });
        }
      }]
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
        {userId && (
          <Text style={styles.userIdText}>
            User ID: {userId}
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
  userIdText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    textAlign: "center",
    marginTop: SIZES.margin.xs,
    fontSize: 10,
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