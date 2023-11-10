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
import QB from 'quickblox-react-native-sdk';
import CustomSearch from '../Components/search';
//@ts-ignore
import _ from 'lodash';
import {useRoute} from '@react-navigation/native';
import {mvs} from '../Config/metrices';

export default function CreateChannelScreen({navigation}: any) {
  const {params}: any = useRoute();
  const [channelName, setChannelName] = useState('');
  const [channelError, setChannelError] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any>();
  const [user, setUser] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [value, setValue] = useState('');

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    let data = await firestore().collection('Users').get();
    const userData = data.docs.map(doc => doc.data());
    const filteredUsers = userData.filter(
      (consultant: any) =>
        consultant.profession === params?.categoryName &&
        consultant?.id !== user?.id,
    );
    const statusOrder = [true, false];
    const updatedUsers = filteredUsers.sort(
      (userA: any, userB: any) =>
        statusOrder.indexOf(userA.is_online) -
        statusOrder.indexOf(userB.is_online),
    );
    setUsers(updatedUsers);
    setLoading(false);
  };

  // useEffect(() => {
  //     const collectionRef = firestore()
  //       .collection('Users')
  //       .where('id', '!=', user?.id)
  //       .where('profession','==', params?.categoryName)
  //     const unsubscribe = collectionRef.onSnapshot(querySnapshot => {
  //       const newData: any = [];
  //       querySnapshot?.forEach(doc => {
  //         newData.push({
  //           id: doc.id,
  //           ...doc.data(),
  //         });
  //       });
  //       const statusOrder = [true, false];
  //       const updatedUsers = newData.sort(
  //         (userA: any, userB: any) =>
  //           statusOrder.indexOf(userA.is_online) -
  //           statusOrder.indexOf(userB.is_online),
  //       );
  //       setUsers(updatedUsers);
  //       setLoading(false);
  //     });
  //     return () => {
  //       unsubscribe();
  //     };
  // }, [user]);

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      const userData = jsonValue != null ? JSON.parse(jsonValue) : null;
      setUser(userData);
    } catch (e) {
      // error reading value
    }
  };

  function handleButtonPress(item: any) {
    const createDialogParam: any = {
      type: QB.chat.DIALOG_TYPE.CHAT,
      occupantsIds: [item?.id],
    };

    QB.chat
      .createDialog(createDialogParam)
      .then(function (dialog) {
        // handle as neccessary, i.e.
        // subscribe to chat events, typing events, etc.
        navigation.navigate('Chat', {dialog, user});
      })
      .catch(function (e) {
        //console.log('error:', e);
        // handle error
      });
  }

  // const getUsers = async () => {
  //   const filter = {
  //     field: QB.users.USERS_FILTER.FIELD.ID,
  //     type: QB.users.USERS_FILTER.TYPE.NUMBER,
  //     operator: QB.users.USERS_FILTER.OPERATOR.IN,
  //     value: '', // value should be of type String
  //   };
  //   QB.users
  //     .getUsers({filter: filter})
  //     .then(result => {
  //       console.log('RESULT:', JSON.stringify(result, null, 8));
  //       setUsers(result?.users);
  //       setIsRefreshing(false);
  //       setLoading(false);
  //     })
  //     .catch(function (error) {
  //       // handle error
  //       console.log('handle error', error);
  //     });
  // };

  const renderFooter = () => {
    return isLoadingNextPage ? (
      <View style={styles.bottomLoader}>
        <ActivityIndicator size="small" color={Colors.firstColor} />
      </View>
    ) : null;
  };

  const debouncedSearch = _.debounce((value: string) => {
    setLoading(true);
    const filteredUsers = users.filter((user: any) =>
      user?.fullName.toLowerCase().includes(value.toLowerCase()),
    );
    setUsers(filteredUsers);
    setLoading(false);
  }, 500);
  const handleSearchChange = (value: string) => {
    if (value) {
      debouncedSearch(value?.trim());
    } else {
      fetchUsers();
    }
  };

  return (
    <>
      <CustomHeader
        title={'Users'}
        showBack
        onBackPress={() => navigation.replace('Category')}
      />
      <CustomSearch
        placeholder="Search Users"
        value={value}
        setValue={setValue}
        onChangeText={(text: any) => handleSearchChange(text)}
        mb={10}
      />
      <View style={styles.rootContainer}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size={'large'} color={Colors.firstColor} />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Not Found</Text>
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
            //2onRefresh={onRefresh}
            refreshing={isRefreshing}
            ListFooterComponent={renderFooter}
            //onEndReached={loadNextUsers}
            onEndReachedThreshold={0}
            renderItem={({item}: any) => (
              <User
                item={item}
                category={params?.categoryName}
                onPress={() => handleButtonPress(item)}
              />
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
    backgroundColor: 'red',
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
  messageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: Colors.firstColor,
    fontSize: mvs(25),
    fontFamily: 'Poppins-Regular',
  },
});
