import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

const CustomDatePicker = ({ 
  visible = false, 
  currentDate = null, 
  onSelectDate, 
  onClose,
  title = "Select Date of Birth",
  confirmText = "Select Date",
  cancelText = "Cancel",
  minYear = null,
  maxYear = null
}) => {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  const monthsFull = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  
  const [yearsList, setYearsList] = useState([]);
  const [daysList, setDaysList] = useState([]);
  
  // Refs for ScrollViews
  const yearScrollRef = useRef(null);
  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);

  // Item height for calculation
  const ITEM_HEIGHT = 40;

  // Generate years based on minYear and maxYear
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const startYear = minYear || currentYear - 100;
    const endYear = maxYear || currentYear;
    
    const years = [];
    for (let i = endYear; i >= startYear; i--) {
      years.push(i);
    }
    setYearsList(years);
    
    // Initialize with current date or passed date
    if (currentDate) {
      try {
        const date = new Date(currentDate);
        if (!isNaN(date.getTime())) {
          setSelectedYear(date.getFullYear());
          setSelectedMonth(date.getMonth());
          setSelectedDay(date.getDate());
        }
      } catch (e) {
        console.warn("Invalid date format:", currentDate);
      }
    } else {
      const today = new Date();
      setSelectedYear(today.getFullYear());
      setSelectedMonth(today.getMonth());
      setSelectedDay(today.getDate());
    }
  }, [currentDate, minYear, maxYear]);

  // Generate days based on selected month and year
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    setDaysList(days);
    
    // Adjust selected day if it exceeds days in month
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedYear, selectedMonth, selectedDay]);

  // Scroll to selected item when it changes
  useEffect(() => {
    if (yearScrollRef.current && yearsList.length > 0) {
      const yearIndex = yearsList.findIndex(y => y === selectedYear);
      if (yearIndex >= 0) {
        const scrollY = yearIndex * ITEM_HEIGHT;
        setTimeout(() => {
          yearScrollRef.current?.scrollTo({ y: scrollY, animated: true });
        }, 100);
      }
    }
  }, [selectedYear, yearsList]);

  useEffect(() => {
    if (monthScrollRef.current) {
      const scrollY = selectedMonth * ITEM_HEIGHT;
      setTimeout(() => {
        monthScrollRef.current?.scrollTo({ y: scrollY, animated: true });
      }, 100);
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (dayScrollRef.current && daysList.length > 0) {
      const dayIndex = selectedDay - 1;
      const scrollY = dayIndex * ITEM_HEIGHT;
      setTimeout(() => {
        dayScrollRef.current?.scrollTo({ y: scrollY, animated: true });
      }, 100);
    }
  }, [selectedDay, daysList]);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const handleMonthSelect = (monthIndex) => {
    setSelectedMonth(monthIndex);
  };

  const handleDaySelect = (day) => {
    setSelectedDay(day);
  };

  const handleConfirm = () => {
    const formattedDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    onSelectDate && onSelectDate(formattedDate);
    onClose && onClose();
  };

  const getCurrentDate = () => {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    return date.toDateString();
  };

  // Render items with centered selection indicator
  const renderYearItem = (year, index) => {
    const isSelected = selectedYear === year;
    return (
      <TouchableOpacity
        key={year}
        style={[
          styles.columnItem,
          isSelected && styles.columnItemSelected
        ]}
        onPress={() => handleYearSelect(year)}
      >
        <View style={[
          styles.columnItemContent,
          isSelected && styles.columnItemContentSelected
        ]}>
          <Text style={[
            styles.columnItemText,
            isSelected && styles.columnItemTextSelected
          ]}>
            {year}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMonthItem = (month, index) => {
    const isSelected = selectedMonth === index;
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.columnItem,
          isSelected && styles.columnItemSelected
        ]}
        onPress={() => handleMonthSelect(index)}
      >
        <View style={[
          styles.columnItemContent,
          isSelected && styles.columnItemContentSelected
        ]}>
          <Text style={[
            styles.columnItemText,
            isSelected && styles.columnItemTextSelected
          ]}>
            {month}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDayItem = (day, index) => {
    const isSelected = selectedDay === day;
    return (
      <TouchableOpacity
        key={day}
        style={[
          styles.columnItem,
          isSelected && styles.columnItemSelected
        ]}
        onPress={() => handleDaySelect(day)}
      >
        <View style={[
          styles.columnItemContent,
          isSelected && styles.columnItemContentSelected
        ]}>
          <Text style={[
            styles.columnItemText,
            isSelected && styles.columnItemTextSelected
          ]}>
            {day}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Current Selection Display */}
          <View style={styles.selectedDatePreview}>
            <Text style={styles.selectedDatePreviewText}>
              {getCurrentDate()}
            </Text>
          </View>
          
          {/* Three Row Selector */}
          <View style={styles.threeRowSelector}>
            {/* Year Column */}
            <View style={styles.columnContainer}>
              <Text style={styles.columnTitle}>Year</Text>
              <View style={styles.columnScrollContainer}>
                <View style={styles.selectionIndicatorTop} />
                <View style={styles.selectionIndicatorMiddle} />
                <View style={styles.selectionIndicatorBottom} />
                
                <ScrollView 
                  ref={yearScrollRef}
                  style={styles.columnScrollView}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                  {yearsList.map(renderYearItem)}
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                </ScrollView>
              </View>
            </View>
            
            {/* Month Column */}
            <View style={styles.columnContainer}>
              <Text style={styles.columnTitle}>Month</Text>
              <View style={styles.columnScrollContainer}>
                <View style={styles.selectionIndicatorTop} />
                <View style={styles.selectionIndicatorMiddle} />
                <View style={styles.selectionIndicatorBottom} />
                
                <ScrollView 
                  ref={monthScrollRef}
                  style={styles.columnScrollView}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                  {months.map(renderMonthItem)}
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                </ScrollView>
              </View>
            </View>
            
            {/* Day Column */}
            <View style={styles.columnContainer}>
              <Text style={styles.columnTitle}>Day</Text>
              <View style={styles.columnScrollContainer}>
                <View style={styles.selectionIndicatorTop} />
                <View style={styles.selectionIndicatorMiddle} />
                <View style={styles.selectionIndicatorBottom} />
                
                <ScrollView 
                  ref={dayScrollRef}
                  style={styles.columnScrollView}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                >
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                  {daysList.map(renderDayItem)}
                  <View style={{ height: ITEM_HEIGHT * 2 }} />
                </ScrollView>
              </View>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  selectedDatePreview: {
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  selectedDatePreviewText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  threeRowSelector: {
    flexDirection: "row",
    height: 300,
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  columnContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  columnScrollContainer: {
    flex: 1,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
  },
  columnScrollView: {
    flex: 1,
  },
  columnItem: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  columnItemSelected: {
    backgroundColor: "transparent",
  },
  columnItemContent: {
    width: "80%",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  columnItemContentSelected: {
    backgroundColor: "#3B82F6",
  },
  columnItemText: {
    fontSize: 16,
    color: "#6B7280",
  },
  columnItemTextSelected: {
    color: "white",
    fontWeight: "600",
  },
  selectionIndicatorTop: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E7EB",
    zIndex: 1,
  },
  selectionIndicatorMiddle: {
    position: "absolute",
    top: 120,
    left: 0,
    right: 0,
    height: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#3B82F6",
    backgroundColor: "rgba(59, 130, 246, 0.05)",
    zIndex: 1,
  },
  selectionIndicatorBottom: {
    position: "absolute",
    top: 160,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#E5E7EB",
    zIndex: 1,
  },
  actions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default CustomDatePicker;