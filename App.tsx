import LoginScreen from './src/Screens/LoginScreen';
import SignupScreen from './src/Screens/SignupScreen';
import Navigation from './src/Navigator/Navigation';
import { AuthProvider } from './src/Context/authProvider';
import Toast from 'react-native-toast-message';
import { PaperProvider } from 'react-native-paper';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
GoogleSignin.configure({
  webClientId:
    '9475515452-vlaj16b1r27sqf8joap26ca240cse5va.apps.googleusercontent.com',
});


function App(): JSX.Element {
  return (
    <PaperProvider>
      <AuthProvider>
        <Navigation />
        <Toast />
      </AuthProvider>
    </PaperProvider>
  );
}

export default App;
