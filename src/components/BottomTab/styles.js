import { Dimensions, StyleSheet } from 'react-native';
import { moderateScale, COLORS, FONTS, SIZES, SHADOWS } from '../../utils/AppTheme';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  footerContainer: {
    width,
    height: SIZES.button.lg,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  footerBtnContainer: {
    width: '25%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding.sm,
  },
  imgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeText: {
    marginTop: SIZES.margin.xs,
    color: COLORS.primary,
    ...FONTS.caption,
    fontWeight: FONTS.weight.semiBold,
  },
  inactiveText: {
    marginTop: SIZES.margin.xs,
    color: COLORS.textSecondary,
    ...FONTS.caption,
    fontWeight: FONTS.weight.regular,
  },
  profileContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  profileBadge: {
    width: SIZES.xs,
    height: SIZES.xs,
    position: 'absolute',
    right: '25%',
    top: 0,
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius.full,
  },
  badgeContainer: {
    position: 'absolute',
    top: -SIZES.padding.xs,
    right: -SIZES.padding.sm,
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius.sm,
    height: moderateScale(18),
    width: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xs,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: SIZES.font.xxs,
    fontWeight: FONTS.weight.bold,
  },
  iconContainer: {
    width: SIZES.icon.xxl,
    height: SIZES.icon.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.radius.full,
  },
});

export default styles;