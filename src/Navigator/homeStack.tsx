import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';
import HomeScreen from '../Screens/HomeScreen';
import Colors from '../Contants/Colors';
import {IconButton} from 'react-native-paper';
import CreateChannelScreen from '../Screens/CreateChannelScreen';
import ChatScreen from '../Screens/ChatScreen';

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.firstColor,
        },
        headerTintColor: '#ffffff',
        headerTitle: 'Shayan Chat',
        headerTitleStyle: {
          fontSize: 22,
        },
      }}>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={({navigation}) => ({
          headerRight: () => (
            <IconButton
              icon="plus"
              size={28}
              iconColor="#ffffff"
              onPress={() => navigation.navigate('CreateChannel')}
            />
          ),
        })}
      />
      <Stack.Screen name="CreateChannel" component={CreateChannelScreen} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({route}: any) => ({
          title: route.params.channel.name,
        })}
      />
    </Stack.Navigator>
  );
}
