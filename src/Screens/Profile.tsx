//import liraries
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {Component, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Button} from 'react-native-paper';
import Colors from '../Contants/Colors';
import CustomHeader from '../Components/header';
//@ts-ignore
import UserAvatar from 'react-native-user-avatar';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// create a component
const Profile = ({navigation}: any) => {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>();

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
      setUser(userData);
      return userData;
    } catch (e) {
      // error reading value
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            // Perform logout action here
            try {
              setLoading(true);
              //await chatkitty.endSession();
              await AsyncStorage.clear();
              if (user?.userType == 'google') {
                GoogleSignin?.revokeAccess();
                await auth().signOut();
              } else {
                await auth().signOut();
              }
              setLoading(false);
              navigation.replace('Login');
            } catch (error) {
              setLoading(false);
            }
          },
        },
      ],
      {cancelable: false},
    );
  };
  return (
    <>
      <CustomHeader title={'Profile'} />
      <View style={styles.container}>
        <UserAvatar size={100} name={user?.displayName} />
        <Text style={styles.userName}>{user?.displayName}</Text>
        <Button
          icon="logout"
          mode="contained"
          buttonColor={Colors.firstColor}
          loading={loading}
          onPress={handleLogoutPress}>
          Logout
        </Button>
      </View>
    </>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#2c3e50',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.firstColor,
    marginVertical: 20,
  },
});

//make this component available to the app
export default Profile;
