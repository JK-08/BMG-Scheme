import React from 'react'
import { Text, StyleSheet } from 'react-native'
import PropTypes from 'prop-types'
import theme from '../../../utils/AppTheme'

const { COLORS, FONTS, SIZES } = theme

function TextDefault(props) {
  const {
    bold,
    center,
    right,
    small,
    H1,
    H2,
    H3,
    H4,
    H5,
    uppercase,
    lineOver,
    numberOfLines,
    textColor = COLORS.textPrimary,
    style,
    onPress,
    children
  } = props

  // Base text style
  const baseStyle = {
    color: textColor,
  }

  // Font family based on weight
  let fontFamily = FONTS.family.regular
  if (bold) fontFamily = FONTS.family.bold

  // Font size based on heading level or size prop
  let fontSize = SIZES.font.md
  let lineHeight = SIZES.font.md * 1.5
  
  if (H1) {
    fontSize = SIZES.heading.h1
    lineHeight = SIZES.heading.h1 * 1.2
    fontFamily = FONTS.family.bold
  } else if (H2) {
    fontSize = SIZES.heading.h2
    lineHeight = SIZES.heading.h2 * 1.3
    fontFamily = FONTS.family.bold
  } else if (H3) {
    fontSize = SIZES.heading.h3
    lineHeight = SIZES.heading.h3 * 1.3
    fontFamily = FONTS.family.semiBold
  } else if (H4) {
    fontSize = SIZES.heading.h4
    lineHeight = SIZES.heading.h4 * 1.4
    fontFamily = FONTS.family.semiBold
  } else if (H5) {
    fontSize = SIZES.heading.h5
    lineHeight = SIZES.heading.h5 * 1.4
    fontFamily = FONTS.family.medium
  } else if (small) {
    fontSize = SIZES.font.sm
    lineHeight = SIZES.font.sm * 1.5
  }

  // Text alignment
  let textAlign = 'left'
  if (center) textAlign = 'center'
  if (right) textAlign = 'right'

  // Text transform
  let textTransform = 'none'
  if (uppercase) textTransform = 'uppercase'

  // Text decoration
  let textDecorationLine = 'none'
  if (lineOver) textDecorationLine = 'line-through'

  const textStyle = {
    ...baseStyle,
    fontFamily,
    fontSize,
    lineHeight,
    textAlign,
    textTransform,
    textDecorationLine,
  }

  // Combine with custom styles
  const combinedStyle = StyleSheet.flatten([textStyle, style])

  return (
    <Text
      onPress={onPress}
      numberOfLines={numberOfLines || 0}
      style={combinedStyle}
      allowFontScaling={false} // Prevent system font scaling
    >
      {children}
    </Text>
  )
}

TextDefault.propTypes = {
  // Font weight
  bold: PropTypes.bool,
  
  // Text alignment
  center: PropTypes.bool,
  right: PropTypes.bool,
  
  // Text size variants
  small: PropTypes.bool,
  H5: PropTypes.bool,
  H4: PropTypes.bool,
  H3: PropTypes.bool,
  H2: PropTypes.bool,
  H1: PropTypes.bool,
  
  // Text transform
  uppercase: PropTypes.bool,
  
  // Text decoration
  lineOver: PropTypes.bool,
  
  // Layout
  numberOfLines: PropTypes.number,
  
  // Styling
  textColor: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  
  // Interaction
  onPress: PropTypes.func,
  
  // Content
  children: PropTypes.node.isRequired
}

TextDefault.defaultProps = {
  bold: false,
  center: false,
  right: false,
  small: false,
  H5: false,
  H4: false,
  H3: false,
  H2: false,
  H1: false,
  uppercase: false,
  lineOver: false,
  numberOfLines: 0,
  textColor: COLORS.textPrimary,
  style: {},
  onPress: null,
}

export default TextDefault