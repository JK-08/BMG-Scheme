// utils/useFonts.js
import * as Font from 'expo-font';

const useFonts = async () => {
  await Font.loadAsync({
    // 🎨 Core Fonts
    DancingScript: require('../assets/font/DancingScript.ttf'),
    DMSerif: require('../assets/font/DMSerif.ttf'),
    DomineBold: require('../assets/font/Domine-Bold.ttf'),
    Fancy: require('../assets/font/Fancy.ttf'),
    Lato: require('../assets/font/Lato-Regular.ttf'), 

    // 🖋️ InterDisplay Family
    InterDisplayMedium: require('../assets/font/InterDisplay-Medium.otf'),
  

    // 🖋️ PlayfairDisplay Family

    PlayfairDisplayMedium: require('../assets/font/PlayfairDisplay-Medium.ttf'),

    // 🖋️ Poppins Family
    PoppinsBold: require('../assets/font/Poppins-Bold.ttf'),
    PoppinsRegular: require('../assets/font/Poppins-Regular.ttf'),

    // 🖋️ Times & Trajan Fonts
    TrajanProBold: require('../assets/font/TrajanPro-Bold.otf'),
    TrajanProRegular: require('../assets/font/TrajanPro-Regular.ttf'),
  });
};

export default useFonts;
