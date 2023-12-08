//import liraries
import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View, TextInput} from 'react-native';
import {Button, Modal} from 'react-native-paper';
import CustomHeader from '../Components/header';
import Colors from '../Contants/Colors';
//@ts-ignore
import UserAvatar from 'react-native-user-avatar';
import {useDispatch, useSelector} from 'react-redux';
import {onLogout} from '../Contants/Utils';
import {mvs} from '../Config/metrices';
import QB from 'quickblox-react-native-sdk';

// create a component
const Profile = ({navigation}: any) => {
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [visible, setVisible] = useState(false);

  const handleChangePassword = async () => {

    if(password!==user?.password){
      Alert.alert("password mismatch");
      return;
    }

    const updateUserParams = {
      password,
      newPassword,
    };

    QB.users
      .update(updateUserParams)
      .then(function (updatedUser) {
        setVisible(false);
        Alert.alert('password changed');
      })
      .catch(function (e) {
        console.error('error in updating password', e);
      });
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => onLogout(user, dispatch, navigation),
        },
      ],
      {cancelable: false},
    );
  };
  return (
    <>
      <CustomHeader title={'Profile'} />
      <View style={styles.container}>
        <UserAvatar size={100} name={user?.fullName} />
        <Text style={styles.userName} ellipsizeMode="tail" numberOfLines={1}>
          {user?.fullName}
        </Text>

        <Modal
          visible={visible}
          contentContainerStyle={{backgroundColor: 'white', padding: 20}}>
          <View style={{padding: 16}}>
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 16,
              }}
              value={password}
              onChangeText={(password: any) => setPassword(password)}
              placeholder="Enter password"
            />
            <TextInput
              style={{
                height: 40,
                borderColor: 'gray',
                borderWidth: 1,
                marginBottom: 16,
              }}
              value={newPassword}
              onChangeText={(newPassword: any) => setNewPassword(newPassword)}
              placeholder="Enter New password"
            />
            <Button mode="contained" onPress={handleChangePassword}>
              Update
            </Button>
          </View>
        </Modal>

        {visible ? null : (
          <>
            <Text style={{margin: 40}} onPress={() => setVisible(!visible)}>
              Change Password
            </Text>
            <Button
              icon="logout"
              mode="contained"
              buttonColor={Colors.firstColor}
              loading={loading}
              onPress={handleLogoutPress}>
              Logout
            </Button>
          </>
        )}
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
    fontFamily: 'Poppins-Regular',
    color: Colors.firstColor,
    marginVertical: 20,
    width: mvs(250),
    textAlign: 'center',
  },
});

//make this component available to the app
export default Profile;
