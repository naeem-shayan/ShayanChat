import {createStackNavigator} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import HomeScreen from '../Screens/HomeScreen';
import Colors from '../Contants/Colors';
import {IconButton} from 'react-native-paper';
import CreateChannelScreen from '../Screens/CreateChannelScreen';
import ChatScreen from '../Screens/ChatScreen';
import {chatkitty, channelDisplayName} from '../ChatKitty';
import {ActivityIndicator, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';

const Stack = createStackNavigator();

export default function HomeStack() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null)

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
    getData()
  },[])

  const onLogout = async (navigation: any) => {
    try {
      setLoading(true);
      await AsyncStorage.clear();
      await chatkitty.endSession();
      auth().signOut();
      setLoading(false);
      //navigation.replace('LoginScreen')
    } catch (error) {
      setLoading(false);
    }
  };
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.firstColor,
        },
        headerTintColor: '#ffffff',
        //headerTitle: 'Shayan Chat',
        headerTitleStyle: {
          fontSize: 22,
        },
      }}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={({navigation}) => ({
          headerTitle: 'Conversations',
          headerRight: () => (
            <View style={{flexDirection: 'row'}}>
              <IconButton
                icon="plus"
                size={28}
                iconColor="#ffffff"
                onPress={() => navigation.navigate('CreateChannel')}
              />
              {loading ? (
                <ActivityIndicator
                  style={{paddingHorizontal: 10}}
                  size={'small'}
                  color={Colors.white}
                />
              ) : (
                <IconButton
                  icon="logout"
                  size={28}
                  iconColor="#ffffff"
                  onPress={() => onLogout(navigation)}
                />
              )}
            </View>
          ),
        })}
      />
      <Stack.Screen
        options={({navigation}) => ({
          headerTitle: 'Users',
        })}
        name="CreateChannel"
        component={CreateChannelScreen}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({route}: any) => ({
          title: channelDisplayName(route.params.channel, user?.displayName) /* Add this */,
        })}
      />
    </Stack.Navigator>
  );
}
