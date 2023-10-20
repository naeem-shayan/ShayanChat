import LoginScreen from './src/Screens/LoginScreen';
import SignupScreen from './src/Screens/SignupScreen';
import Navigation from './src/Navigator/Navigation';
import {AuthProvider} from './src/Context/authProvider';
import Toast from 'react-native-toast-message';
import {PaperProvider} from 'react-native-paper';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';
GoogleSignin.configure({
  webClientId:
    '9475515452-vlaj16b1r27sqf8joap26ca240cse5va.apps.googleusercontent.com',
});

function App(): JSX.Element {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      console.log('AppState', appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);
  const toastConfig = { success: () => <></>};
  return (
    <PaperProvider>
      <AuthProvider>
        <Navigation />
        <Toast config={toastConfig}/>
      </AuthProvider>
    </PaperProvider>
  );
}

export default App;
