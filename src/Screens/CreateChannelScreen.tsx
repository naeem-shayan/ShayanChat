import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Divider, IconButton, List, Title} from 'react-native-paper';
import {chatkitty} from '../ChatKitty';
import Colors from '../Contants/Colors';
import {FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import User from '../Components/user';
import CustomHeader from '../Components/header';

export default function CreateChannelScreen({navigation}: any) {
  const [channelName, setChannelName] = useState('');
  const [channelError, setChannelError] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any>();
  const [user, setUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);

  const onRefresh = () => {
    //set isRefreshing to true
    setIsRefreshing(true);
    getUsers();
    // and set isRefreshing to false at the end of your callApiMethod()
  };

  function handleButtonPress(item: any) {
    chatkitty
      .createChannel({
        type: 'DIRECT',
        members: [{id: item.id}],
      })
      .then((result: any) => {
        navigation.navigate('Chat', {channel: result?.channel, user});
      });
  }

  useEffect(() => {
    getData();
    getUsers();
  }, []);

  useEffect(() => {
    chatkitty.onUserPresenceChanged(async user => {
      const presence = user.presence; // Update online users list
      getUsers();
    });
  }, []);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
      setUser(userData);
    } catch (e) {
      // error reading value
    }
  };

  const getUsers = async () => {
    const data: any = await chatkitty.listUsers();
    let users: any = data?.paginator?.items;
    const statusOrder = [true, false];
    users = users.sort(
      (a: any, b: any) =>
        statusOrder.indexOf(a.presence.online) -
        statusOrder.indexOf(b.presence.online),
    );
    setUsers(users);
    setIsRefreshing(false);
    setLoading(false);
  };

  const renderFooter = () => {
    return isLoadingNextPage ? (
      <View style={styles.bottomLoader}>
        <ActivityIndicator size="small" color={Colors.firstColor} />
      </View>
    ) : null;
  };

  const loadNextUsers = async () => {
    const result: any = await chatkitty.listUsers();
    const paginator: any = result?.paginator;
    const items = paginator.items;
    paginator.hasNextPage=true;
    if (paginator.hasNextPage) {
      setIsLoadingNextPage(true);
      const nextPaginator = await paginator.nextPage();
      let nextItems = nextPaginator.items;
      const statusOrder = [true, false];
      nextItems = nextItems.sort(
        (a: any, b: any) =>
          statusOrder.indexOf(a.presence.online) -
          statusOrder.indexOf(b.presence.online),
      );
      setUsers([...users, ...nextItems]);
      setIsLoadingNextPage(false);
    }
  };

  return (
    <>
      <CustomHeader title={'Users'} />
      <View style={styles.rootContainer}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size={'large'} color={Colors.firstColor} />
          </View>
        ) : (
          <FlatList
            data={users}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.loader}>
                <Text style={styles.notFound}>No Record Found</Text>
              </View>
            }
            keyExtractor={(item: any) => item.id}
            ItemSeparatorComponent={() => <Divider />}
            onRefresh={onRefresh}
            refreshing={isRefreshing}
            ListFooterComponent={renderFooter}
            onEndReached={loadNextUsers}
            onEndReachedThreshold={0}
            renderItem={({item}: any) => (
              <User item={item} onPress={() => handleButtonPress(item)} />
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    zIndex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  buttonLabel: {
    fontSize: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: Colors.firstColor,
    padding: 16,
    borderWidth: 0.5,
    borderRadius: 16,
    color: Colors.textColor,
  },
  signupButton: {
    width: '90%',
    height: 48,
    borderRadius: 16,
    // borderWidth: 1,
    borderColor: Colors.firstColor,
    backgroundColor: Colors.secondColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '5%',
    alignSelf: 'center',
  },
  signupText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errors: {
    color: Colors.errorColor,
    fontSize: 15,
    alignSelf: 'flex-start',
    marginLeft: 30,
  },
  newAccountText: {
    margin: 20,
    color: Colors.textColor,
    alignSelf: 'center',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
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
  bottomLoader: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});
