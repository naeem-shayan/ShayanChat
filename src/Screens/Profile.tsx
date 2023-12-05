//import liraries
import React, {useState} from 'react';
import {Alert, StyleSheet, Text, View} from 'react-native';
import {Button} from 'react-native-paper';
import CustomHeader from '../Components/header';
import Colors from '../Contants/Colors';
//@ts-ignore
import UserAvatar from 'react-native-user-avatar';
import {useDispatch, useSelector} from 'react-redux';
import {onLogout} from '../Contants/Utils';
import {mvs} from '../Config/metrices';

// create a component
const Profile = ({navigation}: any) => {
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();

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
    width: mvs(300),
  },
});

//make this component available to the app
export default Profile;
