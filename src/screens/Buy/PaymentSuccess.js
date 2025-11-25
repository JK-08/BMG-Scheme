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

// ✅ Import SMS service
import smsService from "../../services/SMSService";
import NotificationService from "../../services/NotificationService";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme";

const PaymentSuccess = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [storedPaymentData, setStoredPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [smsSent, setSmsSent] = useState(false); // ⬅️ avoid double trigger
  const [isJoiningPayment, setIsJoiningPayment] = useState(true);

  const {
    status,
    orderDetails,
    schemeData,
    paymentStatus,
    productData,
    isInstallmentPayment,
    paymentType,
  } = route.params || {};

  console.log("[PaymentSuccess] Screen loaded with status:", status);

  const isSuccess = status === "SUCCESS";

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

  // ======================================================
  // ✅ SEND INSTALLMENT PAYMENT SUCCESS SMS
  // ======================================================
  // ======================================================
  // ✅ SEND INSTALLMENT OR JOINING PAYMENT SUCCESS SMS + NOTIFICATION
  // ======================================================
  useEffect(() => {
    if (!isSuccess || smsSent) {
      console.log(
        "[PaymentSuccess] Skipped sending - already sent or payment failed"
      );
      return;
    }

    const sendUpdates = async () => {
      console.log("[PaymentSuccess] Sending SMS + Notification");

      try {
        const mobile =
          productData?.personalInfo?.mobile ||
          orderDetails?.customer?.contact ||
          null;

        if (!mobile) {
          console.warn("[PaymentSuccess] No mobile number found");
          return;
        }

        const userId = await AsyncStorage.getItem("userId");
        console.log("customerid", userId);

        const name =
          productData?.personalInfo?.pName ||
          orderDetails?.customer?.name ||
          "Customer";

        const amount = orderDetails?.amount || productData?.amount || 0;

        const schemeName =
          orderDetails?.schemeInfo?.schemeName ||
          productData?.schemeSummary?.schemeName ||
          "BMG Scheme";

        const lastPaid =
          productData?.lastPaidDate ||
          schemeData?.rDate ||
          new Date().toISOString();

        const monthYear = new Date(lastPaid).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        });

        const paidDate = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const paid = new Date(lastPaid);
        const nextDueObj = new Date(paid.setMonth(paid.getMonth() + 1));

        const nextDueDate = nextDueObj.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        // ======================================================
        // 1️⃣ SEND SMS
        // ======================================================
        await smsService.sendPaymentSuccessSMS(
          mobile,
          name,
          schemeName,
          amount,
          monthYear,
          paidDate,
          nextDueDate
        );

        console.log("[PaymentSuccess] Payment SMS sent");
        console.log("userid", userId);

        // ======================================================
        // 2️⃣ SEND PUSH NOTIFICATION (JOINING PAYMENT ONLY)
        // ======================================================
        if (userId) {
          console.log("[PaymentSuccess] Sending join-notification");

          // Choose scheme banner automatically
          let bannerUrl =
            "https://scheme.bmgjewellers.com/uploads/slider/0691777d-6673-46a2-949b-39e7d4c76671_90.jpg";

          if (schemeName.toLowerCase().includes("amount")) {
            bannerUrl =
              "https://scheme.bmgjewellers.com/uploads/scheme/e5686d85-88b1-43e4-9733-b6143e1742cc_78.jpg";
          } else if (schemeName.toLowerCase().includes("fixed")) {
            bannerUrl =
              "https://scheme.bmgjewellers.com/uploads/scheme/7d40f881-c1f5-4d21-bdec-f596e139ca85_scheme3.jpg";
          } else if (schemeName.toLowerCase().includes("smartpay")) {
            bannerUrl =
              "https://scheme.bmgjewellers.com/uploads/scheme/b964c9ae-2305-4722-be29-f209043357b6_scheme2.jpg";
          }

          // ⭐ FIXED PAYLOAD ⭐
          await NotificationService.sendSchemeJoinNotification({
            userId: String(userId),
            schemeName,
            amount,
            imageUrl: bannerUrl,
          });

          console.log("[PaymentSuccess] Join notification sent");
        }

        setSmsSent(true);
      } catch (err) {
        console.error("[PaymentSuccess] Error sending SMS/Notification:", err);
      }
    };

    sendUpdates();
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

  const groupCode =
    productData?.groupCode ||
    orderDetails?.groupCode ||
    orderDetails?.productData?.groupCode ||
    "N/A";

  const regNo =
    productData?.regNo ||
    orderDetails?.regNo ||
    orderDetails?.productData?.regNo ||
    "N/A";

  const schemeName =
    orderDetails?.schemeInfo?.schemeName ||
    productData?.schemeSummary?.schemeName ||
    schemeData?.schemeName ||
    "SuperGold Scheme";

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

        <Text style={styles.title}>Payment Successful!</Text>

        <Text style={styles.subtitle}>
          Your payment for{" "}
          <Text style={{ fontWeight: FONTS.weight.bold }}>{schemeName}</Text>{" "}
          has been processed successfully.
        </Text>

        <Text style={styles.infoText}>
          Your payment of{" "}
          <Text style={{ fontWeight: FONTS.weight.bold }}>
            ₹{orderDetails?.amount || productData?.amount}
          </Text>{" "}
          has been processed successfully
          {isJoiningPayment && " and your Scheme Code is"}
        </Text>

        {isJoiningPayment && (
          <Text style={[styles.highlightText, { marginTop: SIZES.padding.md }]}>
            {groupCode} - {regNo}
          </Text>
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
//  STYLES (unchanged)
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
