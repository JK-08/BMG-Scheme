import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  StyleSheet,
} from "react-native";
import BottomTab from "../../components/BottomTab/BottomTab";
import GoldPlan from "../../ui/ProductCard/GoldPlans";
import GoldPlansSkeleton from "../../components/SkeletonLoader/GoldPlansSkeleton";
import { SafeAreaView } from "react-native-safe-area-context";
import CommonHeader from "../../components/CommonHeader/CommonHeader";
import { getAllSchemes } from "../../services/SchemeNameService";
import appTheme from "../../utils/MainTheme";

const { COLORS, moderateScale } = appTheme;
const IMAGE_BASE_URL = "https://scheme.bmgjewellers.com";

function GoldPlanScreen() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const data = await getAllSchemes();

        const formattedSchemes = data.map((s) => ({
          schemeId: s.SchemeId ?? 0,
          schemeName: s.schemeName || s.SchemeName || "Unnamed Scheme",
          description: s.SchemeSName || s.schemeSName || "No description",
          schemeImage: s.image_path ? IMAGE_BASE_URL + s.image_path : null,
        }));

        setSchemes(formattedSchemes);
      } catch (error) {
        console.error("Failed to load schemes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <GoldPlansSkeleton />
          <GoldPlansSkeleton />
        </>
      );
    }

    if (!schemes.length) {
      return <Text style={styles.noDataText}>No  Plans available.</Text>;
    }

    return schemes.map((scheme) => (
      <GoldPlan
        key={scheme.schemeId}
        schemeId={scheme.schemeId}
        schemeName={scheme.schemeName}
        description={scheme.description}
        schemeImage={scheme.schemeImage} // <-- important
        styles={styles.itemCardContainer}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../../assets/image.png")}
        style={styles.mainBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={styles.safeArea}>
          <CommonHeader title="Saving Schemes" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderContent()}
          </ScrollView>

          <BottomTab screen="GOLDPLANS" />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainBackground: { flex: 1, width: "100%", height: "100%" },
  backgroundImageStyle: { opacity: 0.9 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 5, paddingBottom: 20 },
  itemCardContainer: { marginBottom: 15 },
  noDataText: { color: COLORS.danger, textAlign: "center", padding: 20 },
});

export default GoldPlanScreen;
