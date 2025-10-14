import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  ImageBackground,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import styles from './styles';
import BottomTab from '../../components/BottomTab/BottomTab';
import { TextDefault } from '../../components';
import ProductCard from '../../ui/ProductCard/ProductCard';
import ProductCardSkeleton from '../../components/SkeletonLoader/ProductCardSkeleton';
import CommonHeader from '../../components/CommonHeader/CommonHeader';
import { getPhoneDetails } from '../../services/SchemeDetailsService';
import { COLORS } from '../../utils/Theme';

function DiscoverPlace({ navigation }) {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPhoneSearchData = async () => {
    try {
      const storedPhoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      if (!storedPhoneNumber) {
        setError('Phone number not found');
        setLoading(false);
        return;
      }

      console.log('Fetching data for phone:', storedPhoneNumber);
      
      // Use the service to get phone details
      const accounts = await getPhoneDetails(storedPhoneNumber);
      console.log('Raw API response accounts:', accounts);
      console.log('Number of accounts found:', accounts.length);

      if (!accounts || accounts.length === 0) {
        setError('No schemes available for this account, So please join the scheme and enjoy our benifits');
        setProductData([]);
        setLoading(false);
        return;
      }

      // Process accounts and determine status
      const processedProducts = accounts.map((item) => {
        const currentDate = new Date();
        const maturityDate = item.maturityDate ? new Date(item.maturityDate) : null;
        const isActive = !maturityDate || currentDate < maturityDate;
        const status = isActive ? 'Active' : 'Deactive';

        return {
          ...item,
          status,
          // Map old property names for compatibility
          regno: item.regNo,
          groupcode: item.groupCode,
          pname: item.pname || item.personalInfo?.pName,
          maturitydate: item.maturityDate,
          accountDetails: {
            schemeSummary: item.schemeSummary,
            personalInfo: item.personalInfo
          }
        };
      });

      console.log('Processed products:', processedProducts.length);
      setProductData(processedProducts);

      if (processedProducts.length === 0) {
        setError('No valid product data found');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch data: ${err.message}`);
      Alert.alert('Fetch Error', `Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPhoneSearchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPhoneSearchData();
  };

  const renderProductCard = ({ item }) => (
    <ProductCard
      productData={item}
      navigation={navigation}
    />
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={localStyles.loadingContainer}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
      );
    }

    if (error && productData.length === 0) {
      return (
        <View style={localStyles.errorContainer}>
          <TextDefault style={localStyles.errorText}>
            {error}
          </TextDefault>
        </View>
      );
    }

    return (
      <FlatList
        data={productData}
        renderItem={renderProductCard}
        keyExtractor={(item, index) => `${item.regNo}-${item.groupCode}-${index}`}
        contentContainerStyle={localStyles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={localStyles.emptyContainer}>
            <TextDefault style={localStyles.emptyText}>
              No schemes found
            </TextDefault>
          </View>
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/bg4.jpg')}
        style={styles.mainBackground}
        imageStyle={styles.backgroundImageStyle}
      >
        <SafeAreaView style={styles.safeArea}>
          <CommonHeader title="Your Schemes" />
          
          <View style={localStyles.contentContainer}>
            {renderContent()}
          </View>

          <BottomTab screen="SCHEMES" />
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const localStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: 'center',
    fontSize: 16,
  },
  emptyText: {
    color: COLORS.textLight,
    textAlign: 'center',
    fontSize: 16,
  },
});

export default DiscoverPlace;