import React, {useContext, useEffect, useState} from 'react';
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

const Stack = createStackNavigator();

const Navigation = () => {
  const [user, setUser] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
      setUser(userData);
      setLoading(false);
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'Connect' : 'Login'}
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
