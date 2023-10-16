import LoginScreen from './src/Screens/LoginScreen';
import SignupScreen from './src/Screens/SignupScreen';
import Navigation from './src/Navigator/Navigation';
import {AuthProvider} from './src/Context/authProvider';
import Toast from 'react-native-toast-message';
import {PaperProvider} from 'react-native-paper';

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
