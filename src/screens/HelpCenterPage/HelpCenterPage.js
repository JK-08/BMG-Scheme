import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ImageBackground
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { LinearGradient } from 'expo-linear-gradient'
import { COLORS, SIZES, FONTS, verticalScale, moderateScale,SHADOWS} from '../../utils/MainTheme'
import CommonHeader from '../../components/CommonHeader/CommonHeader'

const SUPPORT_NUMBER = '919514333601'

function HelpCenterPage() {
  const handlePhoneCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`)
  }

  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`)
  }

  const handleOpenMap = () => {
    const address = 'M/s. BMG Jewellers Pvt Ltd, 160, Melamasi St, Madurai-625001'
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    Linking.openURL(url)
  }

  const handleWhatsApp = (message) => {
    const url = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(message)}`
    Linking.openURL(url).catch(() => {
      alert('Make sure WhatsApp is installed')
    })
  }

  const ContactCard = ({ icon, title, children, iconBg }) => (
    <LinearGradient
      colors={[COLORS.background, COLORS.surface]}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Icon name={icon} size={20} color={COLORS.white} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </LinearGradient>
  )

  const ContactItem = ({ text, icon, onPress, isAddress = false }) => (
    <TouchableOpacity style={styles.contactItem} onPress={onPress}>
      {isAddress ? (
        <View style={styles.addressContainer}>
          <Text style={styles.contactText}>M/s. BMG Jewellers Pvt Ltd</Text>
          <Text style={styles.contactText}>160, Melamasi St, Madurai-625001</Text>
        </View>
      ) : (
        <Text style={styles.contactText}>{text}</Text>
      )}
      <Icon name={icon} size={18} color={COLORS.secondary} />
    </TouchableOpacity>
  )

  const QuickAction = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Icon name={icon} size={20} color={COLORS.secondary} />
      <Text style={styles.actionText}>{text}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/image.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <CommonHeader title="Help Center" subtitle="We're here to help you" />
        
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Contact Cards */}
          <View style={styles.cardsContainer}>
            <ContactCard 
              icon="phone" 
              title="Phone Numbers" 
              iconBg={COLORS.secondary}
            >
              <ContactItem
                text="+91-95143 33601"
                icon="call"
                onPress={() => handlePhoneCall('919514333601')}
              />
              <ContactItem
                text="+91-95143 33609"
                icon="call"
                onPress={() => handlePhoneCall('919514333609')}
              />
            </ContactCard>

            <ContactCard 
              icon="email" 
              title="Email Address" 
              iconBg={COLORS.secondary}
            >
              <ContactItem
                text="Contact@bmgjewellers.in"
                icon="mail-outline"
                onPress={() => handleEmail('Contact@bmgjewellers.in')}
              />
            </ContactCard>

            <ContactCard 
              icon="location-on" 
              title="Office Address" 
              iconBg={COLORS.secondary}
            >
              <ContactItem
                icon="place"
                onPress={handleOpenMap}
                isAddress={true}
              />
            </ContactCard>
          </View>

          {/* Support Hours */}
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursTitle}>Customer Support Hours</Text>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Monday - Saturday</Text>
              <Text style={styles.hoursTime}>10:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.hoursRow}>
              <Text style={styles.hoursDay}>Sunday</Text>
              <Text style={styles.hoursTime}>11:00 AM - 4:00 PM</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.actionsTitle}>Quick Actions</Text>
            <View style={styles.actionsRow}>
              <QuickAction
                icon="chat"
                text="Live Chat"
                onPress={() => handleWhatsApp('Hello! I need help via Live Chat.')}
              />
              <QuickAction
                icon="help-outline"
                text="FAQs"
                onPress={() => handleWhatsApp('I would like to see the FAQs.')}
              />
              <QuickAction
                icon="description"
                text="Support"
                onPress={() => handlePhoneCall('919514333601')}
              />
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  scrollContainer: { 
    flexGrow: 1,
    paddingBottom: verticalScale(16),
  },
  cardsContainer: {
    paddingHorizontal: SIZES.padding.md,
    marginBottom: verticalScale(20),
  },
  card: {
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginBottom: verticalScale(12),
    // ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  iconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: SIZES.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(10),
  },
  cardTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  contactText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: moderateScale(8),
  },
  addressContainer: { 
    flex: 1,
  },
  hoursContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginHorizontal: SIZES.padding.md,
    marginBottom: verticalScale(20),
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  hoursTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(8),
  },
  hoursDay: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary,
  },
  hoursTime: { 
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.md,
    color: COLORS.textPrimary, 
  },
  actionsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.padding.md,
    marginHorizontal: SIZES.padding.md,
    // ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionsTitle: {
    fontFamily: FONTS.family.bodyBold,
    fontSize: SIZES.font.lg,
    color: COLORS.textPrimary,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: moderateScale(8),
  },
  actionButton: {
    alignItems: 'center',
    padding: SIZES.padding.sm,
    backgroundColor: COLORS.secondaryLight + '30',
    borderRadius: SIZES.radius.sm,
    flex: 1,
    minHeight: verticalScale(70),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  actionText: {
    fontFamily: FONTS.family.body,
    fontSize: SIZES.font.sm,
    color: COLORS.primary,
    marginTop: verticalScale(6),
    textAlign: 'center',
  }
})

export default HelpCenterPage