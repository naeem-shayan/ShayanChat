//import liraries
import React, {Component, useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ActivityIndicator} from 'react-native-paper';
import Colors from './Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {chatkitty} from '../ChatKitty';
import firestore from '@react-native-firebase/firestore';
import QB from 'quickblox-react-native-sdk';

// create a component
const ServerConnection = ({navigation}: any) => {
  const [connecting, setConnecting] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [success, setSuccess] = useState(false);

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

  useEffect(() => {
    if (user) {
      QB.chat
        .connect({
          userId: user?.id,
          password: user?.password,
        })
        .then(function () {
          // connected successfully
          console.log('connected successfully');
          setSuccess(true);
          setConnecting(false);
        })
        .catch(function (e) {
          // some error occurred
          console.log('some error occurred', e);
          //setConnecting(false);
        })
        .finally(() => {
          setSuccess(true);
          setConnecting(false);
        });
    }
  }, [user]);

  // useEffect(() => {
  //   (async () => {
  //     setConnecting(true);
  //     const user = await getData();
  //     await chatkitty.endSession();
  //     const result: any = await chatkitty.startSession({
  //       username: user?.uid,
  //       authParams: {
  //         idToken: user?.idToken,
  //         displayName: user?.displayName,
  //         deviceToken: user?.deviceToken,
  //         userId: user?.id,
  //       },
  //     });
  //     if (result.failed) {
  //       setSuccess(false);
  //       setConnecting(false);
  //     } else {
  //       const updatedUser = {
  //         ...user,
  //         id: result?.session?.user?.id,
  //         callStatus: result?.session?.user?.callStatus,
  //         displayName: result?.session?.user?.displayName,
  //         displayPictureUrl: result?.session?.user?.displayPictureUrl,
  //         name: result?.session?.user?.name,
  //         presence: result?.session?.user?.presence,
  //         properties: result?.session?.user?.properties,
  //       };
  //       firestore()
  //         .collection('Users')
  //         .doc(`${result?.session?.user?.id}`)
  //         .set(updatedUser)
  //         .then(async () => {
  //           await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  //           setUser(updatedUser);
  //           setSuccess(true);
  //           setConnecting(false);
  //         })
  //         .catch(error => {
  //           setSuccess(false);
  //           setConnecting(false);
  //         });
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    if (!connecting) {
      if (success) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    }
  }, [connecting]);
  return (
    <View style={styles.container}>
      <ActivityIndicator size={'large'} color={Colors.firstColor} />
      <Text style={styles.status}>
        {connecting
          ? 'Connecting ...'
          : success
          ? 'Connected'
          : 'Connection fail'}
      </Text>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    fontSize: 20,
    marginTop: 30,
    color: '#000',
  },
});

//make this component available to the app
export default ServerConnection;
