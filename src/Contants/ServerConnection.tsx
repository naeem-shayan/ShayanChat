//import liraries
import firestore from '@react-native-firebase/firestore';
import QB from 'quickblox-react-native-sdk';
import React, { useEffect, useState } from 'react';
import { NativeEventEmitter, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import Colors from './Colors';

// create a component
const ServerConnection = ({navigation}: any) => {
  const dispatch = useDispatch();
  const [connecting, setConnecting] = useState(true);
  const [success, setSuccess] = useState(false);
  const user = useSelector((state: any) => state.user);
  //@ts-ignore
  const emitter = new NativeEventEmitter(QB.webrtc);

  useEffect(() => {
    QB.webrtc
      .init()
      .then(function () {
        console.log(`/* module is ready for calls processing */`);
      })
      .catch(function (e) {
        console.log(/* handle error */ e);
      });
  }, []);

  useEffect(() => {
    if (user) {
      QB.chat
        .connect({
          userId: user?.id,
          password: user?.socialType === 'facebook' ? user?.token : user?.password,
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

  useEffect(() => {
    if (user) {
      firestore()
        .collection('Users')
        .doc(`${user?.id}`)
        .update({
          is_online: true,
        })
        .then(async () => {})
        .catch(error => {});
    }
  }, [user]);

  // function eventHandler (event) {
  //   const {
  //     type, // type of the event (i.e. `@QB/CALL` or `@QB/REJECT`)
  //     payload
  //   } = event
  //   const {
  //     userId, // id of QuickBlox user who initiated this event (if any)
  //     session // current or new session
  //   } = payload
  //   dispatch(callSession(session))
  //   Alert.alert('incomming.')
  // }
 
  // Object.keys(QB.webrtc.EVENT_TYPE).forEach(key => {
  //   emitter.addListener(QB.webrtc.EVENT_TYPE[key], eventHandler)
  // })

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
      if (success && user) {
        if (user.userType === 'consultant' && !user.isProfileComplete) {
          navigation.replace('Home', {screen: 'Profile'});
        } else {
          navigation.replace('Home');
        }
      }
      else{
        console.error("Quickblock connection failed")
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
