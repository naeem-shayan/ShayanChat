import React, {useContext, useEffect, useRef, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {chatkitty} from '../ChatKitty';
import Loading from '../Components/loading';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../Screens/LoginScreen';
import SignupScreen from '../Screens/SignupScreen';
import BottomTab from './bottomTab';
import ChatScreen from '../Screens/ChatScreen';
import ServerConnection from '../Contants/ServerConnection';
import QB from 'quickblox-react-native-sdk';
import firestore from '@react-native-firebase/firestore';
import {AppState} from 'react-native';

const Stack = createStackNavigator();

const Navigation = () => {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<any>(null);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [state, setState] = useState('');

  useEffect(() => {
    getData();
    QB.auth
      .getSession()
      .then(function (session) {
        // handle session
        setSession(session);
        setLoading(false);
      })
      .catch(function (e) {
        // something went wrong
      });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      setState(appState?.current);
      console.log(appState?.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
      setUser(userData);
      // setLoading(false);
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    if (session) {
      firestore()
        .collection('Users')
        .doc(`${user?.id}`)
        .update({
          is_online: appState.current !== 'background',
        })
        .then(async () => {})
        .catch(error => {
          setLoading(false);
        });
    }
  }, [session, state]);

  if (loading) {
    return <Loading />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={session?.applicationId ? 'Connect' : 'Login'}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={BottomTab} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Connect" component={ServerConnection} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
