import LoginScreen from './src/Screens/LoginScreen';
import SignupScreen from './src/Screens/SignupScreen';
import Navigation from './src/Navigator/Navigation';
import Toast from 'react-native-toast-message';
import {PaperProvider} from 'react-native-paper';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useEffect, useRef, useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Colors from './src/Contants/Colors';

GoogleSignin.configure({
  webClientId:
    '9475515452-vlaj16b1r27sqf8joap26ca240cse5va.apps.googleusercontent.com',
});

function App(): JSX.Element {
  const toastConfig = {success: () => <></>};
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{flex: 1, backgroundColor: Colors.white}}
        edges={{bottom: 'off', top: 'maximum'}}>
        <PaperProvider>
          <Navigation />
          <Toast config={toastConfig} />
        </PaperProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;
