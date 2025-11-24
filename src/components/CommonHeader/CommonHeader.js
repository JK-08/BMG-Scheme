import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../utils/AppTheme';

const { COLORS, FONTS, SIZES, moderateScale, verticalScale, SHADOWS } = theme;

const CommonHeader = ({
  title,
  subtitle = null,
  showBack = true,
  rightComponent = null,
  leftComponent = null,
  onBackPress = null,
  backgroundColor = COLORS.background,
  textColor = COLORS.textPrimary,
  transparent = false,
  elevated = true,
  animated = true,
  centerTitle = true,
  backIconName = 'arrow-back',
  backIconColor = COLORS.white,
  statusBarStyle = 'light-content',
  style = {},
}) => {
  const navigation = useNavigation();
  const slideAnim = useRef(new Animated.Value(animated ? -50 : 0)).current;
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animated]);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const containerStyle = [
    styles.container,
    transparent && styles.transparentContainer,
    elevated && styles.elevated,
    { backgroundColor: transparent ? 'transparent' : backgroundColor },
    style,
  ];

  const animatedStyle = animated
    ? {
        transform: [{ translateY: slideAnim }],
        opacity: fadeAnim,
      }
    : {};

  return (
    <>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={transparent ? 'transparent' : backgroundColor}
        translucent={transparent}
      />
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: transparent ? 'transparent' : backgroundColor }}
      >
        <Animated.View style={[containerStyle, animatedStyle]}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {leftComponent ? (
              leftComponent
            ) : showBack ? (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleBackPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={backIconName} size={moderateScale(24)} color={backIconColor} />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.leftPlaceholder} />
            )}
          </View>

          {/* Center Section */}
          <View style={[styles.centerSection, !centerTitle && styles.centerSectionLeft]}>
            <Text
              style={[styles.title, { color: textColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[styles.subtitle, { color: COLORS.textSecondary }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightComponent || <View style={styles.rightPlaceholder} />}
          </View>
        </Animated.View>
      </SafeAreaView>
    </>
  );
};

// 🔍 Header with Search / Filter
export const SearchHeader = ({ title, onSearchPress, onFilterPress, ...props }) => {
  return (
    <CommonHeader
      title={title}
      rightComponent={
        <View style={styles.actionButtons}>
          {onSearchPress && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onSearchPress}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="search" size={moderateScale(22)} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          )}
          {onFilterPress && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onFilterPress}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="filter" size={moderateScale(22)} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      }
      {...props}
    />
  );
};

// ⚙️ Header with Multiple Actions
export const ActionHeader = ({ title, actions = [], ...props }) => {
  return (
    <CommonHeader
      title={title}
      rightComponent={
        <View style={styles.actionButtons}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.iconButton}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color || COLORS.primary }]}>
                <Ionicons
                  name={action.icon}
                  size={moderateScale(22)}
                  color={COLORS.white}
                />
              </View>
              {action.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{action.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      }
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding.lg,
    paddingVertical: verticalScale(SIZES.padding.md),
    minHeight: verticalScale(60),
  },
  transparentContainer: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  leftSection: {
    width: moderateScale(50),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding.sm,
  },
  centerSectionLeft: {
    alignItems: 'flex-start',
  },
  rightSection: {
    width: moderateScale(50),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  iconButton: {
    width: moderateScale(44),
    height: moderateScale(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius.full,
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  actionIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  leftPlaceholder: {
    width: moderateScale(44),
  },
  rightPlaceholder: {
    width: moderateScale(44),
  },
  title: {
    ...FONTS.h4,
    fontSize: SIZES.font.xl,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.bodySmall,
    fontSize: SIZES.font.sm,
    color: COLORS.textSecondary,
    marginTop: verticalScale(SIZES.xs),
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  badge: {
    position: 'absolute',
    top: moderateScale(6),
    right: moderateScale(6),
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius.full,
    minWidth: moderateScale(18),
    height: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.xs,
    borderWidth: 2,
    borderColor: COLORS.background,
    ...SHADOWS.xs,
  },
  badgeText: {
    ...FONTS.caption,
    fontSize: SIZES.font.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
});

// Platform-specific adjustments
if (Platform.OS === 'web') {
  styles.iconButton = {
    ...styles.iconButton,
    cursor: 'pointer',
  };
}

// Additional responsive adjustments for small screens
if (SIZES.screen.width < 375) {
  styles.container = {
    ...styles.container,
    paddingHorizontal: SIZES.padding.md,
    paddingVertical: verticalScale(SIZES.padding.sm),
    minHeight: verticalScale(56),
  };
  
  styles.title = {
    ...styles.title,
    fontSize: SIZES.font.lg,
  };
}

// For large screens
if (SIZES.screen.width > 414) {
  styles.container = {
    ...styles.container,
    paddingVertical: verticalScale(SIZES.padding.lg),
    minHeight: verticalScale(64),
  };
  
  styles.title = {
    ...styles.title,
    fontSize: SIZES.font.xxl,
  };
}

export default CommonHeader;