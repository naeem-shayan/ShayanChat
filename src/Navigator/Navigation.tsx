import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {AuthContext, AuthProvider} from '../Context/authProvider';
import {chatkitty} from '../ChatKitty';
import AuthStack from './authStack';
import Loading from '../Components/loading';
import HomeStack from './homeStack';


const Stack = createStackNavigator();

const Navigation = () => {
  const {user, setUser}:any = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    return chatkitty.onCurrentUserChanged(currentUser => {
      setUser(currentUser);

      if (initializing) {
        setInitializing(false);
      }

      setLoading(false);
    });
  }, [initializing, setUser]);

  if (loading) {
    return <Loading />;
  }
  return (
    <NavigationContainer>
      {user ?<HomeStack/> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Navigation;
