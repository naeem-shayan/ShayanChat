import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Alert, FlatList, StyleSheet, View} from 'react-native';
import {Divider, List} from 'react-native-paper';
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
  const [reload, setReload] = useState<any>();

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
    const unsubscribe = messaging().setBackgroundMessageHandler(
      async remoteMessage => {
        //console.log('Message handled in the background!', remoteMessage);
        setReload(Math.random());
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      //console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
      setReload(Math.random());
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let isCancelled = false;
    getData();
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
  }, [isFocused, loading, connecting, reload]);

  if (loading) {
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
