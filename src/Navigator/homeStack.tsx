import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import HomeScreen from '../Screens/HomeScreen';
import Colors from '../Contants/Colors';
import {IconButton} from 'react-native-paper';
import CreateChannelScreen from '../Screens/CreateChannelScreen';
import ChatScreen from '../Screens/ChatScreen';
import {chatkitty, channelDisplayName, checkUserStatus} from '../ChatKitty';
import {ActivityIndicator, View, Text} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../Screens/LoginScreen';
import SignupScreen from '../Screens/SignupScreen';
import BottomTab from './bottomTab';

const Stack = createStackNavigator();

export default function HomeStack({initialRoot} : any) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [initial, setInitailRoot] = useState(initialRoot);
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
      setUser(userData);
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getData();
  }, []);

  
  return (
    <Stack.Navigator
      initialRouteName={initialRoot}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.firstColor,
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 22,
        },
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={BottomTab}
        options={{headerShown: false}}
      />
      
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{headerShown : false}}
      />
    </Stack.Navigator>
  );
}
