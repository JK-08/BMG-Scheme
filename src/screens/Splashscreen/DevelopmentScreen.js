import React from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../utils/AppTheme"; // Adjust path as needed

export default function DevelopmentScreen() {
  // Optional: Add a subtle pulse animation
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {/* Icon Container */}
        <Animated.View
          style={[
            styles.iconContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.iconEmoji}>🚧</Text>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Under Development</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          We're crafting something amazing for you
        </Text>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Our team is working hard to bring you the best experience possible.
          </Text>
          <Text style={styles.description}>
            This feature will be available soon.
          </Text>
        </View>

        {/* Status Badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Coming Soon</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for your patience
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    alignItems: "center",
    paddingHorizontal: SIZES.padding.xl,
    maxWidth: 400,
  },
  iconContainer: {
    width: SIZES.icon.xxxl * 2,
    height: SIZES.icon.xxxl * 2,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primaryOpacity10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.margin.xxl,
    ...SHADOWS.sm,
  },
  iconEmoji: {
    fontSize: SIZES.icon.xxxl * 1.2,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
    marginBottom: SIZES.margin.sm,
    textAlign: "center",
  },
  subtitle: {
    ...FONTS.bodyLarge,
    color: COLORS.textSecondary,
    marginBottom: SIZES.margin.xl,
    textAlign: "center",
  },
  descriptionContainer: {
    marginBottom: SIZES.margin.xxl,
    gap: SIZES.margin.sm,
  },
  description: {
    ...FONTS.body,
    color: COLORS.textTertiary,
    textAlign: "center",
    lineHeight: SIZES.font.md * 1.6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: SIZES.padding.sm,
    borderRadius: SIZES.radius.full,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  badgeDot: {
    width: SIZES.xs,
    height: SIZES.xs,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.warning,
    marginRight: SIZES.margin.sm,
  },
  badgeText: {
    ...FONTS.label,
    fontSize: SIZES.font.xs,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  footer: {
    position: "absolute",
    bottom: SIZES.padding.xxxl,
  },
  footerText: {
    ...FONTS.caption,
    color: COLORS.textTertiary,
  },
});