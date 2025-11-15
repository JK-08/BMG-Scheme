import React, { useRef, useCallback } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

export default function MainPageWithYouTube() {
  const playerRef = useRef(null);

  const onReady = useCallback(() => {
    console.log("✅ Video is ready to play");
  }, []);

  return (
    <View style={styles.container}>
      <YoutubePlayer
        ref={playerRef}
        height={(width * 9) / 16} // maintains perfect 16:9 ratio
        width={width}
        play={true} // auto play on mount
        mute={false} // set true if you want silent autoplay
        videoId="GCe6_LTWTn0" // 🔹 your YouTube video ID
        onReady={onReady}
        webViewProps={{
          allowsInlineMediaPlayback: true,
          mediaPlaybackRequiresUserAction: false,
          originWhitelist: ["*"],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  
  },
});
