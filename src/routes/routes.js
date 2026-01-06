import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import * as Screen from "../screens";


const MainStack = createStackNavigator();
const NavigationStack = createStackNavigator();

function Drawer() {
  return (
    <NavigationStack.Navigator screenOptions={{ headerShown: false }}>
      <NavigationStack.Screen name="MainLanding" component={Screen.MainLanding} />
      <NavigationStack.Screen name="DeleteButton" component={Screen.DeleteButton} />
      <NavigationStack.Screen name="ProductDescription" component={Screen.ProductDescription} />
      <NavigationStack.Screen name="ProfileDashboard" component={Screen.ProfileDashboard} />
      <NavigationStack.Screen name="MyScheme" component={Screen.MyScheme} />
      <NavigationStack.Screen name="HelpCenter" component={Screen.HelpCenterPage} />
      <NavigationStack.Screen name="PrivacyPolicy" component={Screen.PrivacyPolicyPage} />
      <NavigationStack.Screen name="TermsandCondition" component={Screen.TermsConditionsPage} />
      <NavigationStack.Screen name="AddNewMember" component={Screen.AddNewMember} />
      <NavigationStack.Screen name="GoldPlanScreen" component={Screen.GoldPlanScreen} />
      <NavigationStack.Screen name="KnowMore" component={Screen.KnowMore} />
      <NavigationStack.Screen name="Buy" component={Screen.Buy} />
      <NavigationStack.Screen name="EditingProfile" component={Screen.EditingProfile} />
      <NavigationStack.Screen name="PaymentHistory" component={Screen.PaymentHistory} />
      <NavigationStack.Screen name="MainPageWithYouTube" component={Screen.MainPageWithYouTube} />
      <NavigationStack.Screen name="ProfileSidebar" component={Screen.ProfileSidebar} />
      <NavigationStack.Screen name="AboutPage" component={Screen.AboutPage} />
      <NavigationStack.Screen name="PaymentDetailScreen" component={Screen.PaymentDetailScreen} />
      <NavigationStack.Screen name="PaymentGateway" component={Screen.PaymentGateway} />
      <NavigationStack.Screen name="PaymentWebView" component={Screen.PaymentWebView} />
      <NavigationStack.Screen name="PaymentSuccess" component={Screen.PaymentSuccess} />
      <NavigationStack.Screen name="PaymentFailure" component={Screen.PaymentFailure} />
      <NavigationStack.Screen name="PaymentCancelled" component={Screen.PaymentCancelled} />
      <NavigationStack.Screen name="FAQPage" component={Screen.FAQPage} />
      <NavigationStack.Screen name="NotificationsPage" component={Screen.NotificationsPage} />
      <NavigationStack.Screen name="Rewards" component={Screen.RewardsPage} />
      <NavigationStack.Screen name="EmailFormPage" component={Screen.EmailFormPage} />
      <NavigationStack.Screen name="ReferralScreen" component={Screen.ReferralScreen} />
      <NavigationStack.Screen name="ResetMpin" component={Screen.ResetMpin} />
      <NavigationStack.Screen name="ClosedSchemes" component={Screen.SchemeClosingHistoryScreen} />
      <NavigationStack.Screen name="DigiLockerWebViewScreen" component={Screen.DigiLockerWebViewScreen} />
      <NavigationStack.Screen name="DigiLockerStatusScreen" component={Screen.DigiLockerStatusScreen} />
      <NavigationStack.Screen name="MemberDetailsPage" component={Screen.MemberDetailsPage} />
      <NavigationStack.Screen name="SchemeDetailsPage" component={Screen.SchemeDetailsPage} />
      <NavigationStack.Screen name="SmartPayKnowMore" component={Screen.SmartPayKnowMore} />
      <NavigationStack.Screen name="BrightKnowMore" component={Screen.BrightKnowMore} />
      <NavigationStack.Screen name="LumpsumKnowMore" component={Screen.LumpsumKnowMore} />
      <NavigationStack.Screen name="UserRegisterForm" component={Screen.UserRegisterForm} />
      <NavigationStack.Screen name="AadhaarVerification" component={Screen.AadhaarVerificationScreen} />
      <NavigationStack.Screen name="DuePayment" component={Screen.DuePayment} />
      <NavigationStack.Screen name="SchemeListPage" component={Screen.SchemeListPage} />
      <NavigationStack.Screen name="ReferralPending" component={Screen.ReferralPending} />
    </NavigationStack.Navigator>
  );
}

function AppContainer() {
  const [initialRoute, setInitialRoute] = useState(null);

useEffect(() => {
  const checkUserState = async () => {
    try {
      const hasSeenOnboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      const isMpinCreated = await AsyncStorage.getItem("isMpinCreated");
      const userPhoneNumber = await AsyncStorage.getItem("userPhoneNumber");

      console.log("🟩 Storage Values:", {
        hasSeenOnboarding,
        isMpinCreated,
        userPhoneNumber,
      });

      if (!hasSeenOnboarding) {
        // First-time open → Onboarding
        setInitialRoute("OnboardingScreen");
      } else if (userPhoneNumber) {
        // Phone number exists → go to MPIN
        if (isMpinCreated === "true") {
          setInitialRoute("VerifyMpinScreen");
        } else {
          setInitialRoute("MpinScreen");
        }
      } else {
        // No phone number → show login
        setInitialRoute("LoginPage");
      }
    } catch (error) {
      console.error("❌ Error checking user state:", error);
      setInitialRoute("LoginPage");
    }
  };

  checkUserState();
}, []);


  if (!initialRoute) {
    // Add splash or loader here if you want
    return null;
  }

  return (
    <NavigationContainer>
      <MainStack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        {/* Onboarding & Auth Screens */}
        <MainStack.Screen name="OnboardingScreen" component={Screen.OnboardingScreen} />
        <MainStack.Screen name="LoginPage" component={Screen.LoginPage} />
        <MainStack.Screen name="RegisterPage" component={Screen.RegisterPage} />
        <MainStack.Screen name="OTP" component={Screen.OTP} />

        {/* MPIN Screens */}
        <MainStack.Screen name="MpinScreen" component={Screen.MpinScreen} />
        <MainStack.Screen name="VerifyMpinScreen" component={Screen.VerifyMpinScreen} />
        <MainStack.Screen name="ForgotMpin" component={Screen.ResetMpinScreen} />
        <MainStack.Screen name="EnterNumber" component={Screen.EnterNumberScreen} />
        <MainStack.Screen name="VerifyOtp" component={Screen.VerifyOtpScreen} />

        {/* Main App */}
        <MainStack.Screen name="Drawer" component={Drawer} />
      </MainStack.Navigator>
    </NavigationContainer>
  );
}

export default AppContainer;
