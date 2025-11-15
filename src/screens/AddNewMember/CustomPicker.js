import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet
} from "react-native";
import appTheme from "../../utils/MainTheme";

const { COLORS, SIZES, FONTS } = appTheme;

const CustomPicker = ({
  selectedValue,
  onValueChange,
  items,
  placeholder = "Select an option",
  enabled = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    const selected = items.find((item) => item.value === selectedValue);
    setSelectedLabel(selected ? selected.label : placeholder);
  }, [selectedValue, items, placeholder]);

  const handleSelect = (item) => {
    onValueChange(item.value);
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          !enabled && styles.pickerDisabled,
        ]}
        onPress={() => enabled && setModalVisible(true)}
        activeOpacity={0.7}
        disabled={!enabled}
      >
        <Text
          style={[
            styles.pickerText,
            selectedValue ? styles.selectedText : styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <View style={styles.pickerIcon}>
          <Text style={styles.pickerIconText}>⌄</Text>
        </View>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Option</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Options List */}
            <FlatList
              data={items}
              keyExtractor={(item, index) => `picker-${item.value}-${index}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === selectedValue && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === selectedValue && styles.selectedOptionText,
                    ]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No options available</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Picker Button Styles
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: SIZES.input.height,
    borderRadius: SIZES.radius.md,
    paddingHorizontal: SIZES.padding.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderMedium,
    backgroundColor: 'transparent',
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  pickerText: {
    flex: 1,
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    lineHeight: SIZES.font.md * 1.4,
  },
  selectedText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.body,
  },
  placeholderText: {
    color: COLORS.textTertiary,
    fontFamily: FONTS.family.body,
  },
  pickerIcon: {
    marginLeft: SIZES.sm,
  },
  pickerIconText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.body,
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding.lg,
  },

  // Modal Content
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius.lg,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...appTheme.SHADOWS.lg,
  },

  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  modalTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: SIZES.icon.md,
    height: SIZES.icon.md,
    borderRadius: SIZES.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.sm,
  },
  closeButtonText: {
    fontSize: SIZES.font.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.family.bodyBold,
    lineHeight: SIZES.font.md,
  },

  // Option Items
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SIZES.padding.md,
    paddingHorizontal: SIZES.padding.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  selectedOption: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  optionText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SIZES.sm,
    lineHeight: SIZES.font.md * 1.4,
  },
  selectedOptionText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.family.bodyBold,
  },
  selectedIndicator: {
    width: SIZES.icon.sm,
    height: SIZES.icon.sm,
    borderRadius: SIZES.radius.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicatorText: {
    fontSize: SIZES.font.xs,
    color: COLORS.white,
    fontFamily: FONTS.family.bodyBold,
    lineHeight: SIZES.font.xs,
  },

  // Empty State
  emptyContainer: {
    padding: SIZES.padding.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: SIZES.font.sm * 1.4,
  },
});

export default CustomPicker;