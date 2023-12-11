import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import QB from 'quickblox-react-native-sdk';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Divider} from 'react-native-paper';
import CustomHeader from '../Components/header';
import CustomSearch from '../Components/search';
import User from '../Components/user';
import Colors from '../Contants/Colors';
//@ts-ignore
import {useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {setUser} from '../Actions/userAction';
import LoadingOver from '../Components/loadingOver';
import {mvs} from '../Config/metrices';

export default function CreateChannelScreen(props: any) {
  const user = useSelector((state: any) => state.user);

  const dispatch = useDispatch();

  const {params}: any = useRoute();
  const [channelName, setChannelName] = useState('');
  const [channelError, setChannelError] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any>();
  const [originalUsers, setOriginalUsers] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  const [value, setValue] = useState('');
  const [overLoader, setOverLoader] = useState(false);

  useEffect(() => {
    if (user) {
      const collectionRef = firestore()
        .collection('Users')
        .where('id', '!=', user?.id);
      // .where('category', '==', props.route.params.params.categoryName)
      // .where('isProfileComplete', '==', true)
      const unsubscribe = collectionRef.onSnapshot(querySnapshot => {
        const newData: any = [];
        querySnapshot?.forEach(doc => {
          newData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        const filteredUsers = newData.filter(
          (consultant: any) =>
            consultant?.category === props.route.params.params.categoryName &&
            consultant?.id !== user?.id &&
            consultant?.isProfileComplete,
        );
        const statusOrder = [true, false];
        const updatedUsers = filteredUsers.sort(
          (userA: any, userB: any) =>
            statusOrder.indexOf(userA.is_online) -
            statusOrder.indexOf(userB.is_online),
        );
        setUsers(updatedUsers);
        setOriginalUsers(updatedUsers);
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [user]);

  // useEffect(() => {
  //   if (user) {
  //     fetchUsers();
  //   }
  // }, [user]);

  // const fetchUsers = async () => {
  //   let data = await firestore().collection('Users').get();
  //   const userData = data.docs.map(doc => doc.data());
  //   const filteredUsers = userData.filter(
  //     (consultant: any) =>
  //       consultant?.category === props.route.params.params.categoryName &&
  //       consultant?.id !== user?.id &&
  //       consultant?.isProfileComplete,
  //   );
  //   const statusOrder = [true, false];
  //   const updatedUsers = filteredUsers.sort(
  //     (userA: any, userB: any) =>
  //       statusOrder.indexOf(userA.is_online) -
  //       statusOrder.indexOf(userB.is_online),
  //   );
  //   setUsers(updatedUsers);
  //   setLoading(false);
  // };

  const isDialogExisting = (id: any) => {
    return user?.receipents?.find(
      (receipent: any) => receipent?.receipentId === id,
    );
  };

  function handleButtonPress(item: any) {
    setOverLoader(true);
    let data: any = isDialogExisting(item?.id);
    if (data) {
      setOverLoader(false);
      props.navigation.navigate('Chat', {dialog: data?.dialog, user});
    } else {
      const createDialogParam: any = {
        type: QB.chat.DIALOG_TYPE.CHAT,
        occupantsIds: [item?.id],
      };

      QB.chat
        .createDialog(createDialogParam)
        .then(function (dialog: any) {
          setOverLoader(false);

          const receipent = {
            receipentId:
              dialog?.occupantsIds[0] === user?.id
                ? dialog?.occupantsIds[1]
                : dialog?.occupantsIds[0],
            dialog,
          };

          firestore()
            .collection('Users')
            .doc(`${user?.id}`)
            .update({
              receipents: firestore.FieldValue.arrayUnion(receipent),
            })
            .then(async () => {
              const documentSnapshotAfter = await firestore()
                .collection('Users')
                .doc(`${user?.id}`)
                .get();
              const currentUserDataAfter = documentSnapshotAfter.data();
              dispatch(setUser(currentUserDataAfter));
            })
            .catch(error => {
              console.error(error);
            });
          props.navigation.navigate('Chat', {dialog, user});
        })
        .catch(function (e) {
          console.error('error in updating');
        });
    }
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

  const handleSearchChange = (value: string) => {
    setValue(value);
    if (value) {
      setLoading(true);
      const filteredUsers = users.filter((user: any) =>
        user?.fullName.toLowerCase().includes(value.toLowerCase()),
      );
      setUsers(filteredUsers);
      setLoading(false);
    } else {
      setUsers(originalUsers);
    }
  };

  const handleClearSearch = () => {
    setValue('');
    handleSearchChange('');
  };

  return (
    <>
      <CustomHeader
        title={'Users'}
        showBack
        onBackPress={() => props.navigation.navigate('Category')}
      />
      {users?.length > 1 ? (
        <CustomSearch
          placeholder="Search Users"
          value={value}
          onChangeText={(text: any) => handleSearchChange(text)}
          mb={10}
          mt={20}
          handleClearSearch={handleClearSearch}
        />
      ) : null}
      <View style={styles.rootContainer}>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size={'large'} color={Colors.firstColor} />
          </View>
        ) : users?.length === 0 ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>No users found</Text>
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
                category={props.route.params.params.categoryName}
                onPress={() => handleButtonPress(item)}
              />
            )}
          />
        )}
      </View>
      {overLoader && <LoadingOver />}
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
