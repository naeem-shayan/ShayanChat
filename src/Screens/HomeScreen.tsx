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
import {Dialog, Divider, List} from 'react-native-paper';
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

  useEffect(() => {
    getData()
  },[])

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

  function processDialogs(result: any) {
    // dialogs found matching filter and sort
    setChannels(result?.dialogs);
    setLoading(false);
  }

  useEffect(() => {
    fetchDialogs();
  }, []);

  const fetchDialogs = () => {
    // get dialogs with 'chat' in name
    const filter = {
      field: QB.chat.DIALOGS_FILTER.FIELD.NAME,
      operator: QB.chat.DIALOGS_FILTER.OPERATOR.CTN,
      value: '',
    };
    // sorted ascending by "last_message_date_sent"
    const sort = {
      field: QB.chat.DIALOGS_SORT.FIELD.LAST_MESSAGE_DATE_SENT,
      ascending: true,
    };

    const getDialogsQuery: any = {
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
                name={item?.name}
                onPress={() => {
                  navigation.navigate('Chat', {dialogId: item?.id, user, name: item?.name});
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
