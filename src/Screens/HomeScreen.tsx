import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import {Divider, List} from 'react-native-paper';
import {chatkitty, channelDisplayName} from './../ChatKitty';
import Loading from '../Components/loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatThread from '../Components/chatThread';
import Colors from '../Contants/Colors';
import CustomHeader from '../Components/header';
import messaging from '@react-native-firebase/messaging';
import QB from 'quickblox-react-native-sdk';

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

  // useEffect(() => {
  //   const unsubscribe = messaging().setBackgroundMessageHandler(
  //     async remoteMessage => {
  //       //console.log('Message handled in the background!', remoteMessage);
  //       setReload(Math.random());
  //     },
  //   );

  //   return unsubscribe;
  // }, []);

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     //console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
  //     setReload(Math.random());
  //   });

  //   return unsubscribe;
  // }, []);

  // useEffect(() => {
  //   let isCancelled = false;
  //   getData();
  //   chatkitty
  //     .listChannels({filter: {joined: true, unread: true}})
  //     .then((result: any) => {
  //       let unreads: any = [];
  //       result.paginator.items?.forEach((el: any) => {
  //         unreads.push(el?.id);
  //       });
  //       chatkitty.listChannels({filter: {joined: true}}).then((result: any) => {
  //         if (!isCancelled) {
  //           let channels = result.paginator.items;
  //           const newArray = channels.map((obj: any) => ({
  //             ...obj, // Spread the existing object properties
  //             unread: unreads.includes(obj.id), // Add "unread" key based on the match
  //           }));
  //           setChannels(newArray);
  //           if (loading) {
  //             setLoading(false);
  //           }
  //         }
  //       });
  //     });

  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [isFocused, loading, connecting, reload]);

  function processDialogs(result: any) {
    // dialogs found matching filter and sort
    console.log('dialogs found matching filter and sort', result);
    setChannels(result?.dialogs);
    setLoading(false);
  }

  useEffect(() => {
    fetchDialogs()
  },[])

  const fetchDialogs = () => {
    // get dialogs with 'chat' in name
    const filter = {
      field: QB.chat.DIALOGS_FILTER.FIELD.NAME,
      operator: QB.chat.DIALOGS_FILTER.OPERATOR.CTN,
      value: 'asim',
    };
    // sorted ascending by "last_message_date_sent"
    const sort = {
      field: QB.chat.DIALOGS_SORT.FIELD.LAST_MESSAGE_DATE_SENT,
      ascending: true,
    };

    const getDialogsQuery = {
      filter: filter,
      sort: sort,
      limit: 10,
      skip: 0,
    };

    QB.chat
      .getDialogs(getDialogsQuery)
      .then(processDialogs)
      .catch(function (e) {
        // handle error
      });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <CustomHeader title={'Conversations'} />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size={'large'} color={Colors.firstColor} />
          </View>
        ) : (
          <FlatList
            data={channels}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item: any) => item.id.toString()}
            ItemSeparatorComponent={() => <Divider />}
            ListEmptyComponent={
              <View style={styles.loader}>
                <Text style={styles.notFound}>No Record Found</Text>
              </View>
            }
            renderItem={({item}: any) => (
              <ChatThread
                item={item}
                user={user}
                name={channelDisplayName(item, user?.id)}
                onPress={() => {
                  navigation.navigate('Chat', {channel: item, user});
                }}
              />
            )}
          />
        )}
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    marginTop: 300,
  },
});
