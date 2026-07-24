import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Import SMS service and API service
import smsService from "../../services/SMSService";
import { getPhoneDetails } from "../../services/SchemeDetailsService"; // Import your API function
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme";

const PaymentSuccess = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [storedPaymentData, setStoredPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [smsSent, setSmsSent] = useState(false);
  const [isJoiningPayment, setIsJoiningPayment] = useState(true);
  const [refreshedPhoneData, setRefreshedPhoneData] = useState(null); // Store refreshed phone data
  const [smsSending, setSmsSending] = useState(false); // Track SMS sending state

  const {
    status,
    orderDetails,
    schemeData,
    paymentStatus,
    productData,
    isInstallmentPayment,
    paymentType,
    creditPending, // payment confirmed PAID, but crediting to the scheme is still pending
  } = route.params || {};

  console.log("[PaymentSuccess] Screen loaded with status:", status, "| creditPending:", !!creditPending);

  // Only treat as a full success when the credit/enrollment actually completed —
  // never celebrate (or SMS) an uncredited payment.
  const isSuccess = status === "SUCCESS" && !creditPending;

  // Determine if it's a joining payment
  useEffect(() => {
    const joiningPayment =
      !isInstallmentPayment &&
      paymentType !== "installment" &&
      !route.params?.isInstallmentPayment;

    setIsJoiningPayment(joiningPayment);
    console.log("[PaymentSuccess] Payment type - Joining:", joiningPayment);
  }, [route.params, isInstallmentPayment, paymentType]);

  // Load stored payment data from AsyncStorage
  useEffect(() => {
    const loadStoredPaymentData = async () => {
      console.log("[PaymentSuccess] Loading stored payment data");
      try {
        const storedData = await AsyncStorage.getItem("paymentResponse");
        if (storedData) {
          setStoredPaymentData(JSON.parse(storedData));
          console.log("[PaymentSuccess] Stored payment data loaded");
        } else {
          console.log("[PaymentSuccess] No stored payment data found");
        }
      } catch (error) {
        console.error(
          "[PaymentSuccess] Error loading stored payment data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };
    loadStoredPaymentData();
  }, []);

  // Fetch updated phone details before sending SMS
  const fetchUpdatedPhoneDetails = async () => {
    try {
      console.log("[PaymentSuccess] Fetching updated phone details...");
      
      // Get mobile number from existing data
      const mobile = productData?.personalInfo?.mobile || 
                     productData?.mobile ||
                     orderDetails?.customer?.contact;
      
      if (!mobile) {
        console.warn("[PaymentSuccess] No mobile number found for fetching updated details");
        return null;
      }

      // Call your API to get updated phone details
      const response = await getPhoneDetails(mobile);
      
      if (response && response.data && response.data.length > 0) {
        console.log("[PaymentSuccess] Updated phone data fetched successfully");
        return response.data[0]; // Return the first item from array
      } else if (response && response.length > 0) {
        // Handle case where response is directly the array
        console.log("[PaymentSuccess] Updated phone data fetched successfully");
        return response[0];
      }
      
      console.log("[PaymentSuccess] No updated phone data found");
      return null;
    } catch (error) {
      console.error("[PaymentSuccess] Error fetching updated phone details:", error);
      return null;
    }
  };

  // ======================================================
  // ✅ SEND INSTALLMENT OR JOINING PAYMENT SUCCESS SMS ONLY
  // ======================================================
  useEffect(() => {
    if (!isSuccess || smsSent) {
      console.log(
        "[PaymentSuccess] Skipped sending SMS - already sent or payment failed"
      );
      return;
    }

    const sendSMS = async () => {
      console.log("[PaymentSuccess] Starting SMS sending process");
      setSmsSending(true);

      try {
        // Step 1: Fetch updated phone details from API
        const updatedPhoneData = await fetchUpdatedPhoneDetails();
        
        if (updatedPhoneData) {
          setRefreshedPhoneData(updatedPhoneData);
          console.log("[PaymentSuccess] Using refreshed phone data for SMS");
        } else {
          console.log("[PaymentSuccess] Using original product data for SMS");
        }

        // Step 2: Determine which data source to use
        // Priority: Updated phone data > productData > orderDetails
        const dataToUse = updatedPhoneData || productData;
        
        // Step 3: Get all necessary data for SMS
        const mobile = dataToUse?.personalInfo?.mobile || 
                       dataToUse?.mobile ||
                       orderDetails?.customer?.contact ||
                       null;

        if (!mobile) {
          console.warn("[PaymentSuccess] No mobile number found");
          setSmsSending(false);
          return;
        }

        const name = dataToUse?.pName || 
                     dataToUse?.personalInfo?.pName ||
                     dataToUse?.name ||
                     orderDetails?.customer?.name || 
                     "Customer";

        const amount = dataToUse?.amount || 
                       orderDetails?.amount || 
                       0;

        const schemeName = dataToUse?.schemeSummary?.schemeName || 
                           dataToUse?.schemeName ||
                           orderDetails?.schemeInfo?.schemeName || 
                           "BMG Scheme";

        // Get dates directly from data
        const lastPaidDate = dataToUse?.lastPaidDate || 
                            dataToUse?.paymentHistoryList?.[dataToUse?.paymentHistoryList?.length - 1]?.updateTime;
        
        const nextDueDate = dataToUse?.nextDueDate; // Already in format "2026-03-01"
        
        // Format last paid date from "2025-12-10 00:00:00.0" to "10 Dec 2025"
        let formattedLastPaid = "";
        if (lastPaidDate) {
          const lastPaid = new Date(lastPaidDate);
          if (!isNaN(lastPaid.getTime())) {
            formattedLastPaid = lastPaid.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }
        }

        // Format monthYear from lastPaidDate for SMS
        let monthYear = "";
        if (lastPaidDate) {
          const dateObj = new Date(lastPaidDate);
          if (!isNaN(dateObj.getTime())) {
            monthYear = dateObj.toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            });
          }
        }

        // Current date for payment date
        const paidDate = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // Format next due date if available (already in "2026-03-01" format)
        let formattedNextDue = "";
        if (nextDueDate) {
          const nextDue = new Date(nextDueDate);
          if (!isNaN(nextDue.getTime())) {
            formattedNextDue = nextDue.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }
        }

        // Log the data being sent for debugging
        console.log("[PaymentSuccess] SMS Data:", {
          mobile,
          name,
          schemeName,
          amount,
          monthYear,
          paidDate,
          formattedNextDue
        });

        // ======================================================
        // SEND SMS ONLY
        // ======================================================
        await smsService.sendPaymentSuccessSMS(
          mobile,
          name,
          schemeName,
          amount,
          monthYear,          // e.g., "Dec 2025"
          paidDate,           // e.g., "10 Dec 2025"
          formattedNextDue    // e.g., "01 Mar 2026"
        );

        console.log("[PaymentSuccess] Payment SMS sent successfully");
        setSmsSent(true);
      } catch (err) {
        console.error("[PaymentSuccess] Error sending SMS:", err);
        // You might want to show an error message to the user
      } finally {
        setSmsSending(false);
      }
    };

    sendSMS();
  }, [isSuccess, smsSent]);

  // Auto navigate after 20 seconds
  useEffect(() => {
    console.log("[PaymentSuccess] Auto-navigation timer started (20s)");
    const timer = setTimeout(() => {
      console.log("[PaymentSuccess] Auto-navigating to MainLanding");
      navigation.reset({
        index: 0,
        routes: [{ name: "MainLanding" }],
      });
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    console.log("[PaymentSuccess] User pressed OK - navigating to MainLanding");
    navigation.reset({
      index: 0,
      routes: [{ name: "MainLanding" }],
    });
  };

  const finalPaymentStatus = paymentStatus || storedPaymentData;

  // Use refreshed phone data if available for display
  const dataToDisplay = refreshedPhoneData || productData;

  const groupCode = dataToDisplay?.groupCode ||
                    orderDetails?.groupCode ||
                    orderDetails?.productData?.groupCode ||
                    "N/A";

  const regNo = dataToDisplay?.regNo ||
                orderDetails?.regNo ||
                orderDetails?.productData?.regNo ||
                "N/A";

  const schemeName = orderDetails?.schemeInfo?.schemeName ||
                     dataToDisplay?.schemeSummary?.schemeName ||
                     dataToDisplay?.schemeName ||
                     schemeData?.schemeName ||
                     "SuperGold Scheme";

  // Get next due date from the data to display
  const nextDueDate = dataToDisplay?.nextDueDate;
  let formattedNextDue = "";
  
  if (nextDueDate) {
    const nextDue = new Date(nextDueDate);
    if (!isNaN(nextDue.getTime())) {
      formattedNextDue = nextDue.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("../../assets/icons/success.png")}
          style={styles.image}
        />

        <Text style={styles.title}>
          {creditPending ? "Payment Received" : "Payment Successful!"}
        </Text>

        {creditPending ? (
          <Text style={styles.subtitle}>
            Your payment of{" "}
            <Text style={{ fontWeight: FONTS.weight.bold }}>
              ₹{orderDetails?.amount || dataToDisplay?.amount}
            </Text>{" "}
            for{" "}
            <Text style={{ fontWeight: FONTS.weight.bold }}>{schemeName}</Text>{" "}
            was received. Crediting it to your scheme is taking a little longer
            than usual — it will be completed automatically. Your money is safe.
          </Text>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Your payment for{" "}
              <Text style={{ fontWeight: FONTS.weight.bold }}>{schemeName}</Text>{" "}
              has been processed successfully.
            </Text>

            <Text style={styles.infoText}>
              Your payment of{" "}
              <Text style={{ fontWeight: FONTS.weight.bold }}>
                ₹{orderDetails?.amount || dataToDisplay?.amount}
              </Text>{" "}
              has been processed successfully
              {isJoiningPayment && " and your Scheme Code is"}
            </Text>
          </>
        )}

        {isJoiningPayment && (
          <Text style={[styles.highlightText, { marginTop: SIZES.padding.md }]}>
            {groupCode} - {regNo}
          </Text>
        )}
        
        {/* Display Next Due Date if available */}
        {formattedNextDue && (
          <View style={styles.dueDateContainer}>
            <Text style={styles.dueDateLabel}>Next Due Date:</Text>
            <Text style={styles.dueDateValue}>{formattedNextDue}</Text>
          </View>
        )}

        {/* Show SMS status (skipped while credit is pending) */}
        {!creditPending && (
        <View style={styles.smsStatusContainer}>
          {smsSent ? (
            <Text style={styles.smsSuccessText}>
              ✓ Payment confirmation SMS sent
            </Text>
          ) : smsSending ? (
            <View style={styles.smsLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.smsLoadingText}>
                Sending payment confirmation...
              </Text>
            </View>
          ) : (
            <Text style={styles.smsPendingText}>
              Preparing payment confirmation...
            </Text>
          )}
        </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PaymentSuccess;

// ───────────────────────────────
//  STYLES
// ───────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.padding.lg,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.padding.xl,
    alignItems: "center",
    ...SHADOWS.lg,
  },
  image: {
    width: SIZES.icon.xxxl * 1.5,
    height: SIZES.icon.xxxl * 1.5,
    marginBottom: SIZES.padding.lg,
  },
  title: {
    ...FONTS.h3,
    color: COLORS.textPrimary,
    marginBottom: SIZES.padding.sm,
    textAlign: "center",
  },
  subtitle: {
    ...FONTS.body,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SIZES.padding.md,
    lineHeight: SIZES.font.md * 1.5,
  },
  infoText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: SIZES.font.sm * 1.5,
  },
  highlightText: {
    ...FONTS.bodyMedium,
    color: COLORS.secondary,
    fontWeight: FONTS.weight.bold,
    textAlign: "center",
  },
  dueDateContainer: {
    marginTop: SIZES.padding.lg,
    alignItems: 'center',
  },
  dueDateLabel: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding.xs,
  },
  dueDateValue: {
    ...FONTS.bodyMedium,
    color: COLORS.primary,
    fontWeight: FONTS.weight.bold,
  },
  smsStatusContainer: {
    marginTop: SIZES.padding.lg,
    alignItems: 'center',
    minHeight: 40,
  },
  smsSuccessText: {
    ...FONTS.bodySmall,
    color: COLORS.success,
    textAlign: 'center',
  },
  smsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smsLoadingText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: SIZES.padding.sm,
  },
  smsPendingText: {
    ...FONTS.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    width: "100%",
    marginTop: SIZES.padding.xl,
    height: SIZES.button.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: "100%",
    borderRadius: SIZES.radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    ...FONTS.button,
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: SIZES.padding.sm,
    ...FONTS.body,
    color: COLORS.textTertiary,
  },
});