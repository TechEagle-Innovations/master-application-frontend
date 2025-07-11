import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import loader from '@/assets/loader.json';

interface LoaderProps {
  size?: number;
  fullscreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 220, fullscreen = true }) => {
  return (
    <View style={[styles.container, fullscreen && { flex: 1 }]}> 
      <LottieView
        source={loader}
        autoPlay
        loop
        style={{ width: size, height: size, maxWidth: '90%', maxHeight: '90%' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default Loader;
