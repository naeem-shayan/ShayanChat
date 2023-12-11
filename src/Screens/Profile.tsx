//import liraries
import React, {useState} from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Button} from 'react-native-paper';
import CustomHeader from '../Components/header';
import Colors from '../Contants/Colors';
import QB from 'quickblox-react-native-sdk';
import firestore from '@react-native-firebase/firestore';

//@ts-ignore
import UserAvatar from 'react-native-user-avatar';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import CustomButton from '../Components/button';
import CustomInput from '../Components/textInput';
import {mvs} from '../Config/metrices';
import {onLogout} from '../Contants/Utils';
import {setUser} from '../Actions/userAction';

// create a component
const Profile = ({navigation}: any) => {
  const user = useSelector((state: any) => state.user);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [passwordError, setPassordError] = useState('');
  const [newPasswordError, setNewPassordError] = useState('');
  const [passwordLoader, setPassowordLoader] = useState(false);

  const handleChangePassword = async () => {
    setPassowordLoader(true);
    if (!password) {
      setPassordError('Enter old password');
      return;
    }
    if (password !== user?.password) {
      setPassordError('Old password is incorrect');
      return;
    }

    if (!newPassword) {
      setNewPassordError('Enter new password');
      return;
    }

    setPassordError('');
    setNewPassordError('');

    const updateUserParams = {
      password,
      newPassword,
    };

    QB.users
      .update(updateUserParams)
      .then(function (updatedUser) {
        setVisible(false);
        Alert.alert('password changed');

        const updatedConsultantProfile = {
          password: newPassword,
        };

        setPassword('');
        setNewPassword('');
        firestore()
          .collection('Users')
          .doc(`${user?.id}`)
          .update(updatedConsultantProfile)
          .then(async () => {
            const documentSnapshotAfter = await firestore()
              .collection('Users')
              .doc(`${user?.id}`)
              .get();
            const currentUserDataAfter = documentSnapshotAfter.data();
            dispatch(setUser(currentUserDataAfter));
            setPassowordLoader(false);
          })
          .catch(error => {
            console.error(error);
          });
      })
      .catch(function (e) {
        setPassowordLoader(false);
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
      {visible && <View style={styles.overlay} />}
      <Modal animationType="fade" transparent={true} visible={visible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={{alignSelf: 'flex-end'}}
              onPress={() => {
                setVisible(false);
                setPassordError('');
                setNewPassordError('');
              }}>
              <Icon
                name={'close'}
                size={mvs(30)}
                color={Colors.placeholderColor}
              />
            </TouchableOpacity>
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={(text: any) => setPassword(text)}
              password={true}
              error={passwordError}
            />
            <CustomInput
              label="New Password"
              placeholder="Enter your New password"
              value={newPassword}
              onChangeText={(text: any) => setNewPassword(text)}
              password={true}
              error={newPasswordError}
            />
            <CustomButton
              title="Update password"
              onPress={handleChangePassword}
              loading={passwordLoader}
            />
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <UserAvatar size={100} name={user?.fullName} />
        <Text style={styles.userName} ellipsizeMode="tail" numberOfLines={1}>
          {user?.fullName}
        </Text>

        {!visible && (
          <Text
            style={{margin: 40, color: Colors.firstColor}} // Added color styling
            onPress={() => setVisible(true)}>
            Change Password
          </Text>
        )}

        <Button
          icon="logout"
          mode="contained"
          buttonColor={Colors.firstColor}
          loading={loading}
          onPress={handleLogoutPress}>
          Logout
        </Button>
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    margin: mvs(20),
    backgroundColor: 'white',
    borderRadius: mvs(20),
    padding: mvs(35),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: mvs(15),
    textAlign: 'center',
    color: Colors.textColor,
    fontFamily: 'Poppins-Regular',
  },
});

//make this component available to the app
export default Profile;
