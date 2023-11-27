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
import WelcomeScreen from '../Screens/WelcomeScreen';
import OnboardingScreen from '../Screens/OnboardingScreen';
import Categories from '../Screens/Categories';
import CreateChannelScreen from '../Screens/CreateChannelScreen';
import CallScreen from '../Screens/CallScreen';
import { useSelector } from 'react-redux';

const Stack = createStackNavigator();

const appSettings = {
  accountKey: 'ack_AkZzGjiD-eLYc4QsoaWy',
  appId: '101977',
  authKey: 'ak_Hb9zWK2A92OdLp6',
  authSecret: 'as_8PYdf5ON9SQsD8t',
};

const Navigation = () => {
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [session, setSession] = useState<any>(null);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [deviceState, setDeviceState] = useState('');
  const callSession = useSelector((state: any) => state.callSession);

  useEffect(() => {
    QB.settings
      .init(appSettings)
      .then(function () {
        // SDK initialized successfully
        console.log('SDK initialized successfully');
      })
      .catch(function (e) {
        // Some error occurred, look at the exception message for more details
        console.log(
          'Some error occurred, look at the exception message for more details',
        );
      });
  }, []);

  useEffect(() => {
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
      setDeviceState(appState?.current);
      console.log(appState?.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    QB.auth.getSession().then(function (session) {
      firestore()
        .collection('Users')
        .doc(`${session?.userId}`)
        .update({
          is_online: deviceState !== 'background',
        })
        .then(async () => {})
        .catch(error => {
          setLoading(false);
        });
    });
  }, [deviceState]);

  if (loading) {
    return <Loading />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={session?.applicationId ? 'Connect' : 'Welcome'}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen
          name="CreateChannelScreen"
          component={CreateChannelScreen}
        />
        <Stack.Screen name="Home" component={BottomTab} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Call" component={CallScreen} />
        <Stack.Screen name="Connect" component={ServerConnection} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
