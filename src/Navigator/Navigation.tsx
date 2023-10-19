import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthContext, AuthProvider} from '../Context/authProvider';
import {chatkitty} from '../ChatKitty';
import Loading from '../Components/loading';
import HomeStack from './homeStack';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      <HomeStack initialRoot={!user ? 'Login' : 'Connect'} />
    </NavigationContainer>
  );
};

export default Navigation;
