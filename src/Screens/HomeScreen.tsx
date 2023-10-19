import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Divider, List} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {chatkitty, channelDisplayName} from './../ChatKitty';
import Loading from '../Components/loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatThread from '../Components/chatThread';
import Colors from '../Contants/Colors';
import CustomHeader from '../Components/header';
import messaging from '@react-native-firebase/messaging';

export default function HomeScreen({navigation}: any) {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOut, setLoadingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isFocused = useIsFocused();
  const [connecting, setConnecting] = useState(true);

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
    (async () => {
      setConnecting(true);
      const user = await getData();
      await chatkitty.endSession();
      const result: any = await chatkitty.startSession({
        username: user?.uid,
        authParams: {
          idToken: user?.idToken,
          displayName: user?.displayName,
          deviceToken: user?.deviceToken,
          userId: user?.id,
        },
      });
      if (result.failed) {
        setConnecting(false);
      } else {
        console.log('UpdatedUser:', result?.session?.user);
        const updatedUser = {
          ...user,
          id: result?.session?.user?.id,
          callStatus: result?.session?.user?.callStatus,
          displayName: result?.session?.user?.displayName,
          displayPictureUrl: result?.session?.user?.displayPictureUrl,
          name: result?.session?.user?.name,
          presence: result?.session?.user?.presence,
          properties: result?.session?.user?.properties,
        };

        firestore()
          .collection('Users')
          .doc(`${result?.session?.user?.id}`)
          .set(updatedUser)
          .then(async () => {
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setConnecting(false);
          })
          .catch(error => {
            setConnecting(false);
          });
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!connecting) {
      let isCancelled = false;
      chatkitty.listChannels({filter: {joined: true}}).then((result: any) => {
        if (!isCancelled) {
          setChannels(result.paginator.items);

          if (loading) {
            setLoading(false);
          }
        }
      });

      return () => {
        isCancelled = true;
      };
    }
  }, [isFocused, loading, connecting]);

  if (loading || connecting) {
    return <Loading />;
  }

  return (
    <>
      <CustomHeader title={'Conversations'} />
      <View style={styles.container}>
        <FlatList
          data={channels}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item: any) => item.id.toString()}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({item}: any) => (
            <ChatThread
              item={item}
              user={user}
              name={channelDisplayName(item, user?.id)}
              onPress={() => navigation.navigate('Chat', {channel: item, user})}
            />
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
    paddingHorizontal: 15,
  },
  listTitle: {
    fontSize: 22,
  },
  listDescription: {
    fontSize: 16,
  },
});
