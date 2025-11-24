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

  console.log("📦 PaymentSuccess params:", route.params);

  const isSuccess = status === "SUCCESS";

  // Determine if it's a joining payment
  useEffect(() => {
    const joiningPayment =
      !isInstallmentPayment &&
      paymentType !== "installment" &&
      !route.params?.isInstallmentPayment;

    setIsJoiningPayment(joiningPayment);
    console.log("ℹ️ Is joining payment:", joiningPayment);
  }, [route.params, isInstallmentPayment, paymentType]);

  // Load stored payment data from AsyncStorage
  useEffect(() => {
    const loadStoredPaymentData = async () => {
      console.log("⏳ Loading stored payment data...");
      try {
        const storedData = await AsyncStorage.getItem("paymentResponse");
        if (storedData) {
          setStoredPaymentData(JSON.parse(storedData));
          console.log("✅ Stored payment data loaded:", storedData);
        } else {
          console.log("ℹ️ No stored payment data found");
        }
      } catch (error) {
        console.error("❌ Error loading stored payment data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStoredPaymentData();
  }, []);

  // ======================================================
  // ✅ SEND INSTALLMENT PAYMENT SUCCESS SMS
  // ======================================================
  useEffect(() => {
    if (!isSuccess || smsSent) {
      console.log(
        `ℹ️ SMS sending skipped. Success: ${isSuccess}, SMS sent: ${smsSent}`
      );
      return;
    }

    const sendSMS = async () => {
      console.log("📩 Sending payment success SMS...");
      try {
        const mobile =
          productData?.personalInfo?.mobile ||
          orderDetails?.customer?.contact ||
          null;

        if (!mobile) {
          console.warn("⚠️ No mobile number found for SMS sending.");
          return;
        }

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

        console.log("ℹ️ SMS Details ->", {
          mobile,
          name,
          schemeName,
          amount,
          monthYear,
          paidDate,
          nextDueDate,
        });

        await smsService.sendPaymentSuccessSMS(
          mobile,
          name,
          schemeName,
          amount,
          monthYear,
          paidDate,
          nextDueDate
        );

        console.log("Installment SMS data", {
          mobile,
          name,
          schemeName,
          amount,
          monthYear,
          paidDate,
          nextDueDate,
        });
        console.log("✅ Installment Payment SMS Sent Successfully");
        setSmsSent(true);
      } catch (err) {
        console.error("❌ SMS Error:", err);
      }
    };

    sendSMS();
  }, [isSuccess, smsSent]);

  // Auto navigate after 20 seconds
  useEffect(() => {
    console.log("⏳ Auto-navigation timer set for 20 seconds");
    const timer = setTimeout(() => {
      console.log("➡️ Navigating to MainLanding");
      navigation.reset({
        index: 0,
        routes: [{ name: "MainLanding" }],
      });
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    console.log("➡️ User pressed OK, navigating to MainLanding");
    navigation.reset({
      index: 0,
      routes: [{ name: "MainLanding" }],
    });
  };

  const finalPaymentStatus = paymentStatus || storedPaymentData;
  console.log("ℹ️ Final payment status:", finalPaymentStatus);

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
