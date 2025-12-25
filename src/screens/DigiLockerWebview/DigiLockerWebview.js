// screens/DigiLockerWebViewScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  BackHandler,
  Alert,
  Modal,
  TouchableOpacity,
} from "react-native";
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from "@react-navigation/native";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import theme from "../../utils/AppTheme";
import { aadhaarService, AADHAAR_STATUS } from "../../services/DigiLockerService";

const { COLORS, SIZES, FONTS } = theme;

const DigiLockerWebViewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const webViewRef = useRef(null);
  
  const { verificationUrl, verificationId, onVerificationComplete } = route.params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [showPollingModal, setShowPollingModal] = useState(false);
  const [pollingStatus, setPollingStatus] = useState("");
  const [pollingError, setPollingError] = useState("");
  const [pollingComplete, setPollingComplete] = useState(false);
  const [hasStartedPolling, setHasStartedPolling] = useState(false);
  const [callbackDetected, setCallbackDetected] = useState(false);
  const [webViewLoaded, setWebViewLoaded] = useState(false);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (webViewRef.current && currentUrl !== verificationUrl) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [currentUrl, verificationUrl]);

  // Auto-start polling after a timeout if no callback detected
  useEffect(() => {
    if (webViewLoaded && !hasStartedPolling && !callbackDetected) {
      const timeoutId = setTimeout(() => {
        console.log('Auto-checking verification status after timeout');
        startPolling();
      }, 120000); // 2 minutes timeout

      return () => clearTimeout(timeoutId);
    }
  }, [webViewLoaded, hasStartedPolling, callbackDetected]);

  // Handle successful verification completion
  const handleVerificationSuccess = async (statusResult) => {
    console.log('Verification successful with result:', statusResult);
    
    setPollingStatus("Verification successful! Fetching details...");
    
    try {
      let formData;
      
      // Try to get document data first (more complete info)
      const documentResult = await aadhaarService.getAadhaarDocument(verificationId);
      
      if (documentResult.success) {
        formData = aadhaarService.getFormDataFromAadhaar(documentResult);
      } else {
        // Fallback to status API data
        formData = {
          pName: statusResult.userDetails?.name || '',
          dob: aadhaarService.parseAadhaarDate(statusResult.userDetails?.dob) || '',
          gender: statusResult.userDetails?.gender || '',
          mobile: statusResult.userDetails?.mobile || '',
          idProofNo: aadhaarService.formatAadhaarNumber(
            statusResult.userDetails?.aadhaar || statusResult.userDetails?.uid || ''
          ),
          aadhaarVerified: true,
          aadhaarVerificationId: verificationId,
          aadhaarStatus: statusResult.status,
          aadhaarVerifiedAt: new Date().toISOString(),
        };
      }
      
      // Add user details from status result if document API didn't have them
      if (!formData.pName && statusResult.userDetails?.name) {
        formData.pName = statusResult.userDetails.name;
      }
      
      completeVerification(formData, statusResult.status);
      
    } catch (error) {
      console.error('Error fetching document:', error);
      // Use minimal data from status
      const formData = {
        pName: statusResult.userDetails?.name || '',
        dob: aadhaarService.parseAadhaarDate(statusResult.userDetails?.dob) || '',
        gender: statusResult.userDetails?.gender || '',
        mobile: statusResult.userDetails?.mobile || '',
        idProofNo: aadhaarService.formatAadhaarNumber(statusResult.userDetails?.aadhaar || ''),
        aadhaarVerified: true,
        aadhaarVerificationId: verificationId,
        aadhaarStatus: statusResult.status,
        aadhaarVerifiedAt: new Date().toISOString(),
      };
      completeVerification(formData, statusResult.status);
    }
  };

  // Start polling for verification status
  const startPolling = (source = 'manual') => {
    if (hasStartedPolling) return; // Prevent multiple polling
    setHasStartedPolling(true);
    
    console.log(`Starting polling (source: ${source}) for verification ID:`, verificationId);
    
    setShowPollingModal(true);
    setPollingStatus("Checking verification status...");
    
    aadhaarService.pollVerificationStatus(verificationId, 180000, 2000) // 3 min timeout, 2s interval
      .then((statusResult) => {
        console.log('Polling completed:', statusResult);
        
        if (statusResult.success || statusResult.hasUserDetails) {
          handleVerificationSuccess(statusResult);
        } else {
          // Handle failure
          let errorMessage = statusResult.message || "Verification failed";
          
          // Provide more specific messages based on status
          if (statusResult.status === AADHAAR_STATUS.REJECTED) {
            errorMessage = "Verification was rejected. Please try again.";
          } else if (statusResult.status === AADHAAR_STATUS.FAILED) {
            errorMessage = "Verification failed. Please try again.";
          } else if (statusResult.status === AADHAAR_STATUS.EXPIRED) {
            errorMessage = "Verification session expired. Please restart the process.";
          } else if (statusResult.status === 'TIMEOUT') {
            errorMessage = "Verification timed out. Please check your verification status or try again.";
          } else if (statusResult.status === AADHAAR_STATUS.INITIATED) {
            errorMessage = "Verification is still pending. Please complete the process in DigiLocker.";
          } else if (statusResult.status === AADHAAR_STATUS.PENDING) {
            errorMessage = "Verification is still pending. Please complete the process in DigiLocker.";
          }
          
          setPollingError(errorMessage);
          setTimeout(() => {
            setShowPollingModal(false);
            Alert.alert(
              "Verification Status", 
              errorMessage,
              [
                { 
                  text: "Try Again", 
                  onPress: () => {
                    setHasStartedPolling(false);
                    webViewRef.current?.reload();
                  }
                },
                { 
                  text: "Check Status Again", 
                  onPress: () => {
                    setHasStartedPolling(false);
                    setShowPollingModal(false);
                    setTimeout(() => startPolling('retry'), 500);
                  }
                },
                { 
                  text: "Cancel", 
                  onPress: () => navigation.goBack(),
                  style: "cancel" 
                }
              ]
            );
          }, 1500);
        }
      })
      .catch((error) => {
        console.error('Polling error:', error);
        const errorMsg = error.message || "Failed to check verification status";
        setPollingError(errorMsg);
        setTimeout(() => {
          setShowPollingModal(false);
          Alert.alert(
            "Error", 
            errorMsg,
            [
              { 
                text: "Retry", 
                onPress: () => {
                  setHasStartedPolling(false);
                  startPolling('retry');
                }
              },
              { 
                text: "Cancel", 
                onPress: () => navigation.goBack(),
                style: "cancel" 
              }
            ]
          );
        }, 1500);
      });
  };

  const completeVerification = (formData, status) => {
    setPollingStatus("Verification complete!");
    setPollingComplete(true);
    
    setTimeout(() => {
      setShowPollingModal(false);
      
      // Callback with verified data
      if (onVerificationComplete) {
        onVerificationComplete(formData);
      }
      
      // Show success and navigate back
      Alert.alert(
        "✅ Aadhaar Verified Successfully",
        "Your Aadhaar has been verified and details have been auto-filled.",
        [
          { 
            text: "OK", 
            onPress: () => {
              // Navigate back to form screen
              navigation.goBack();
            }
          }
        ]
      );
    }, 1500);
  };

  const handleNavigationStateChange = (navState) => {
    const url = navState.url;
    setCurrentUrl(url);
    
    // Log URL changes for debugging
    console.log('URL changed:', {
      url: url.substring(0, 100) + (url.length > 100 ? '...' : ''),
      loading: navState.loading,
      title: navState.title
    });
    
    // Enhanced callback detection
    const isCallbackUrl = detectCallbackUrl(url, navState);

    
    if (isCallbackUrl && !hasStartedPolling && !showPollingModal) {
      console.log('Callback detected! URL pattern matched:', isCallbackUrl.reason);
      setCallbackDetected(true);
      
      // Small delay to ensure server has processed the verification
      setTimeout(() => {
        startPolling('callback');
      }, 3000); // Increased delay for server processing
    }
    
    setIsLoading(navState.loading);
  };

  // Enhanced callback detection function
  const detectCallbackUrl = (url, navState) => {
  if (!url) return false;

  const lowerUrl = url.toLowerCase();

  // 1️⃣ Regex-based URL patterns
  const patterns = [
    { pattern: /bmgjewellers:\/\/digilocker-callback/, reason: 'Custom app scheme' },
    { pattern: /digilocker-callback/, reason: 'DigiLocker callback keyword' },

    { pattern: /verification\.cashfree\.com\/.*(complete|success|callback)/, reason: 'Cashfree completion URL' },
    { pattern: /cashfree\.com\/.*verification/, reason: 'Cashfree verification' },

    { pattern: /digilocker\.gov\.in\/.*(callback|redirect|success)/, reason: 'DigiLocker callback' },
    { pattern: /dlcallback/, reason: 'DL callback shorthand' },

    { pattern: /\?status=(success|completed|verified)/, reason: 'Status parameter success' },
    { pattern: /&status=(success|completed|verified)/, reason: 'Status parameter success' },
    { pattern: /status%3D(success|completed|verified)/, reason: 'Encoded status success' },

    { pattern: /redirect_uri=/, reason: 'Redirect URI parameter' },
    { pattern: /redirect_to=/, reason: 'Redirect to parameter' },
  ];

  for (const item of patterns) {
    if (item.pattern.test(lowerUrl)) {
      return item;
    }
  }

  // 2️⃣ Title-based detection
  const title = navState?.title?.toLowerCase();
  if (title && (title.includes('success') || title.includes('verified') || title.includes('complete'))) {
    return { reason: 'Success title detected' };
  }

  // 3️⃣ Query parameter detection
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);

    if (
      params.get('verification_status') === 'success' ||
      params.get('verification') === 'complete' ||
      params.get('aadhaar_status') === 'verified'
    ) {
      return { reason: 'Success query parameter' };
    }
  } catch (e) {
    // Ignore invalid URL parsing errors
  }

  return false;
};


  // Handle successful load
  const handleLoadEnd = () => {
    setIsLoading(false);
    setWebViewLoaded(true);
    
    // Check if current URL indicates completion
    const isComplete = detectCallbackUrl(currentUrl);
    if (isComplete && !hasStartedPolling && !showPollingModal) {
      console.log('Completion detected on load end:', isComplete.reason);
      setTimeout(() => {
        startPolling('load-end');
      }, 2000);
    }
  };

  // Improved manual check
  const checkForManualCompletion = () => {
    Alert.alert(
      "Check Verification Status",
      "Have you completed the verification process in DigiLocker?",
      [
        { 
          text: "No, Continue", 
          style: "cancel" 
        },
        { 
          text: "Yes, I completed it", 
          onPress: () => startPolling('manual-check')
        },
        { 
          text: "No, Go Back", 
          onPress: () => navigation.goBack(),
          style: "destructive"
        }
      ]
    );
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error:', nativeEvent);
    setHasError(true);
    setIsLoading(false);
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Loading DigiLocker...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>❌</Text>
      <Text style={styles.errorTitle}>Failed to Load</Text>
      <Text style={styles.errorText}>
        Unable to load DigiLocker verification page.
      </Text>
      
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          setHasError(false);
          webViewRef.current?.reload();
        }}
      >
        <Text style={styles.retryButtonText}>Retry Loading</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.manualCheckButton}
        onPress={checkForManualCompletion}
      >
        <Text style={styles.manualCheckButtonText}>Check Verification Status</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CommonHeader
        title="DigiLocker Verification"
        subtitle="Complete your Aadhaar verification"
        showBackButton={true}
        onBackPress={() => {
          if (showPollingModal) {
            Alert.alert(
              "Verification in Progress",
              "Verification check is in progress. Are you sure you want to leave?",
              [
                { text: "Continue", style: "cancel" },
                { 
                  text: "Leave", 
                  onPress: () => navigation.goBack(),
                  style: "destructive" 
                }
              ]
            );
          } else {
            checkForManualCompletion();
          }
        }}
        showActionButton={true}
        actionButtonText="Check Status"
        onActionPress={checkForManualCompletion}
      />
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Complete the verification in DigiLocker. After completion, 
          we'll automatically check the status.
        </Text>
        <Text style={styles.verificationIdText}>
          Verification ID: {verificationId}
        </Text>
      </View>
      
      {hasError ? (
        renderError()
      ) : (
        <>
          <WebView
            ref={webViewRef}
            source={{ uri: verificationUrl }}
            style={styles.webview}
            onNavigationStateChange={handleNavigationStateChange}
            onError={handleError}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={handleLoadEnd}
            startInLoadingState={true}
            renderLoading={renderLoading}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            allowsBackForwardNavigationGestures={true}
            userAgent="Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
            onMessage={(event) => {
              console.log('WebView message:', event.nativeEvent.data);
              // You can also check for completion messages from WebView
              if (event.nativeEvent.data.includes('verification_complete')) {
                startPolling('webview-message');
              }
            }}
          />
          
          {isLoading && !showPollingModal && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingOverlayText}>Loading DigiLocker...</Text>
            </View>
          )}
          
          {/* Polling Status Modal */}
          <Modal
            visible={showPollingModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              if (!pollingComplete && !pollingError) {
                Alert.alert(
                  "Stop Verification Check?",
                  "Are you sure you want to stop checking verification status?",
                  [
                    { text: "Continue", style: "cancel" },
                    { 
                      text: "Stop", 
                      onPress: () => {
                        setShowPollingModal(false);
                        setHasStartedPolling(false);
                        Alert.alert(
                          "Verification Incomplete",
                          "Please wait a few moments and check back, or try again if verification doesn't complete.",
                          [{ text: "OK" }]
                        );
                      }
                    }
                  ]
                );
              }
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                {pollingComplete ? (
                  <>
                    <View style={styles.successIcon}>
                      <Text style={styles.successIconText}>✅</Text>
                    </View>
                    <Text style={styles.modalTitle}>Verification Complete!</Text>
                    <Text style={styles.modalText}>
                      Your Aadhaar has been verified successfully.
                    </Text>
                    <Text style={styles.modalSubtext}>
                      Redirecting to form...
                    </Text>
                  </>
                ) : pollingError ? (
                  <>
                    <View style={styles.errorIcon}>
                      <Text style={styles.errorIconText}>❌</Text>
                    </View>
                    <Text style={styles.modalTitle}>Verification Failed</Text>
                    <Text style={styles.modalText}>{pollingError}</Text>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => {
                        setShowPollingModal(false);
                        setHasStartedPolling(false);
                      }}
                    >
                      <Text style={styles.modalButtonText}>Close</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.modalTitle}>Checking Verification Status</Text>
                    <Text style={styles.modalText}>{pollingStatus}</Text>
                    <Text style={styles.modalSubtext}>
                      This may take a few moments. Please wait...
                    </Text>
                    
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View style={styles.progressFill} />
                      </View>
                      <Text style={styles.progressText}>Processing...</Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webview: {
    flex: 1,
  },
  infoContainer: {
    padding: SIZES.padding.md,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  infoText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.margin.xs,
  },
  verificationIdText: {
    ...FONTS.caption,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.md,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 120, // Adjusted for info container
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: SIZES.padding.md,
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingOverlayText: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: SIZES.margin.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.lg,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...theme.SHADOWS.xl,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin.lg,
  },
  successIconText: {
    fontSize: 30,
    color: COLORS.success,
  },
  errorIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.margin.lg,
  },
  errorIconText: {
    fontSize: 30,
    color: COLORS.error,
  },
  modalTitle: {
    ...FONTS.h5,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.md,
    textAlign: 'center',
  },
  modalText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.margin.md,
    lineHeight: 22,
  },
  modalSubtext: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.md,
    marginTop: SIZES.margin.md,
  },
  modalButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    marginTop: SIZES.margin.xl,
    paddingTop: SIZES.padding.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SIZES.margin.md,
  },
  progressFill: {
    height: '100%',
    width: '60%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.xl,
    backgroundColor: COLORS.white,
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: SIZES.margin.lg,
    color: COLORS.error,
  },
  errorTitle: {
    ...FONTS.h4,
    color: COLORS.error,
    marginBottom: SIZES.margin.md,
    textAlign: 'center',
  },
  errorText: {
    ...FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.margin.xl,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.md,
    minWidth: 200,
    alignItems: 'center',
  },
  retryButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.white,
    fontWeight: '600',
  },
  manualCheckButton: {
    backgroundColor: COLORS.gray200,
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.margin.md,
    minWidth: 200,
    alignItems: 'center',
  },
  manualCheckButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  cancelButton: {
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.xl,
    borderRadius: SIZES.radius.md,
    minWidth: 200,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...FONTS.bodyMedium,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
});

export default DigiLockerWebViewScreen;