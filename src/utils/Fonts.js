// utils/useFonts.js
import * as Font from 'expo-font';

const useFonts = async () => {
  await Font.loadAsync({
    // 🖋️ Poppins Family (7 fonts as per your theme)


    'Poppins-Thin': require('../assets/font/Poppins/Poppins-Thin.ttf'),
    'Poppins-Light': require('../assets/font/Poppins/Poppins-Light.ttf'),
    'Poppins-Regular': require('../assets/font/Poppins/Poppins-Regular.ttf'),
    'Poppins-Medium': require('../assets/font/Poppins/Poppins-Medium.ttf'),
    'Poppins-SemiBold': require('../assets/font/Poppins/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('../assets/font/Poppins/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/font/Poppins/Poppins-ExtraBold.ttf'),
    
  });
};

export default useFonts;