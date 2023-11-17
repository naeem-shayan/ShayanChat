import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {chatkitty} from '../ChatKitty';
import Loading from '../Components/loading';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../Screens/HomeScreen';
import CreateChannelScreen from '../Screens/CreateChannelScreen';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {Alert, Text, View} from 'react-native';
import Profile from '../Screens/Profile';
import Colors from '../Contants/Colors';
import Categories from '../Screens/Categories';
import ConsultantProfile from '../Screens/ConsultantProfile';
import {useSelector} from 'react-redux';

const Tab = createBottomTabNavigator();

const BottomTab = () => {
  const user = useSelector((state: any) => state.user);
  return (
    <Tab.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{headerShown: false}}>
      {user.userType === 'user' && (
        <Tab.Screen
          name="Category"
          component={Categories}
          options={{
            tabBarLabel: 'Home',
            tabBarActiveTintColor: Colors.firstColor,
            tabBarIcon: ({color, size}) => (
              <Icons name="home" color={color} size={size} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarActiveTintColor: Colors.firstColor,
          tabBarIcon: ({color, size}) => (
            <Icons name="chat" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={user.userType === 'consultant' ? ConsultantProfile : Profile}
        options={{
          tabBarLabel: 'Profile',
          tabBarActiveTintColor: Colors.firstColor,
          tabBarIcon: ({color, size}) => (
            <Icons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;
