import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SkeletonLoader from "./SkeletonLoader";
import appTheme from "../../utils/MainTheme";

const { COLORS, SIZES, moderateScale } = appTheme;
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.96;
const CARD_HEIGHT = CARD_WIDTH / 1.6;

const ProductCardSkeleton = () => {
  return (
    <View style={[styles.container, { width: CARD_WIDTH, height: CARD_HEIGHT }]}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonLoader
          width={moderateScale(120)}
          height={moderateScale(18)}
          style={styles.darkSkeleton}
        />
        <SkeletonLoader
          width={moderateScale(80)}
          height={moderateScale(18)}
          style={styles.lightSkeleton}
        />
      </View>

      {/* Stats / Content */}
      <View style={styles.content}>
        <View style={styles.row}>
          <SkeletonLoader
            width={moderateScale(70)}
            height={moderateScale(15)}
            style={styles.mediumSkeleton}
          />
          <SkeletonLoader
            width={moderateScale(70)}
            height={moderateScale(15)}
            style={styles.lightSkeleton}
          />
        </View>

        <View style={styles.row}>
          <SkeletonLoader
            width={moderateScale(80)}
            height={moderateScale(15)}
            style={styles.mediumSkeleton}
          />
          <SkeletonLoader
            width={moderateScale(60)}
            height={moderateScale(15)}
            style={styles.lightSkeleton}
          />
        </View>

        <View style={styles.row}>
          <SkeletonLoader
            width={moderateScale(100)}
            height={moderateScale(15)}
            style={styles.mediumSkeleton}
          />
          <SkeletonLoader
            width={moderateScale(60)}
            height={moderateScale(15)}
            style={styles.lightSkeleton}
          />
        </View>
      </View>

      {/* Footer / Action Button */}
      <View style={styles.footer}>
        <SkeletonLoader
          width={moderateScale(100)}
          height={moderateScale(36)}
          style={styles.darkSkeleton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radius.lg,
    backgroundColor: COLORS.surface,
    padding: moderateScale(12),
    marginVertical: moderateScale(8),
    alignSelf: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(12),
  },
  content: {
    marginBottom: moderateScale(12),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: moderateScale(8),
  },
  footer: {
    alignItems: "center",
  },
  darkSkeleton: {
    backgroundColor: COLORS.borderLight,
    borderRadius: SIZES.radius.sm,
  },
  mediumSkeleton: {
    backgroundColor: COLORS.textDisabled,
    borderRadius: SIZES.radius.sm,
  },
  lightSkeleton: {
    backgroundColor: COLORS.textTertiary,
    borderRadius: SIZES.radius.sm,
  },
});

export default React.memo(ProductCardSkeleton);
