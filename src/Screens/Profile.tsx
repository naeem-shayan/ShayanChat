import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import CustomInput from '../Components/textInput';
import Colors from '../Contants/Colors';
import {mvs} from '../Config/metrices';
import CustomButton from '../Components/button';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import {RadioButton} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {onLogout, updateQuickBlockUser} from '../Contants/Utils';
import firestore from '@react-native-firebase/firestore';
import {setUser} from '../Actions/userAction';
import storage from '@react-native-firebase/storage';
import {IconButton} from 'react-native-paper';
import {useIsFocused} from '@react-navigation/native';
import defaultProfilePicture from '../Contants/defaultPicture';
import {validateName} from '../Contants/dist/Utils';

const width = Math.round(Dimensions.get('window').width);

const Profile = ({navigation}: any) => {
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const isFoucs = useIsFocused();

  const [userProfile, setUserProfile] = useState({
    profilePicture: user?.profilePicture || defaultProfilePicture,
    fullName: '',
    gender: 'male',
  });
  const [validationErrors, setValidationErrors] = useState({
    fullNameError: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isFoucs) {
      setUserProfile({
        fullName: user?.fullName || '',
        gender: user?.gender || 'male',
        profilePicture: user?.profilePicture || defaultProfilePicture,
      });
    }
  }, [user, isFoucs]);

  const handleImageUpload = async () => {
    const result: any = await launchImageLibrary({mediaType: 'photo'});
    if (!result?.didCancel) {
      let name = JSON.stringify(new Date().getTime());
      const reference = storage().ref(`images/${name}`);
      const task = reference.putFile(result?.assets[0]?.uri);
      task.on('state_changed', taskSnapshot => {
        console.log(
          `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
        );
      });
      task.then(async () => {
        await storage()
          .ref(`images/${name}`)
          .getDownloadURL()
          .then(async (url: any) => {
            handleInputChange('profilePicture', url);
          })
          .catch(e => console.error(e));
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setUserProfile({...userProfile, [field]: value});
  };

  const checkValidationsErrors = () => {
    const fullNameError = validateName(userProfile.fullName);
    if (fullNameError) {
      setValidationErrors({
        fullNameError,
      });
      return false;
    }
    return true;
  };

  const clearErrors = () => {
    setLoading(true);
    setValidationErrors({
      fullNameError: '',
    });
  };

  const handleUpdate = () => {
    if (checkValidationsErrors()) {
      clearErrors();
      const updateduserProfile = {
        ...user,
        ...userProfile,
        isProfileComplete: true,
      };
      const updatedQuickbloxUserProfile = {
        fullName: userProfile.fullName,
      };
      updateQuickBlockUser(updatedQuickbloxUserProfile);
      firestore()
        .collection('Users')
        .doc(`${user?.id}`)
        .update(updateduserProfile)
        .then(async () => {
          const documentSnapshotAfter = await firestore()
            .collection('Users')
            .doc(`${user?.id}`)
            .get();
          const currentUserDataAfter = documentSnapshotAfter.data();
          dispatch(setUser(currentUserDataAfter));
          setLoading(false);
        })
        .catch(error => {
          console.error(error);
        });
    }
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
    <ScrollView
      nestedScrollEnabled={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{flex: 1}}>
      <View style={styles.logoutContainer}>
        <IconButton
          icon="logout"
          size={28}
          iconColor="#ffffff"
          style={styles.logoutIcon}
          onPress={handleLogoutPress}
        />
      </View>
      <View style={styles.rootContainer}>
        <View>
          <View style={styles.picture}>
            <Image
              source={{
                uri: userProfile.profilePicture || defaultProfilePicture,
              }}
              style={styles.image}
            />
          </View>
          <Icons
            name="camera"
            color={Colors.firstColor}
            size={35}
            style={styles.uploadCamera}
            onPress={handleImageUpload}
          />
        </View>
        <Text style={styles.username}>{user?.fullName}</Text>
        <CustomInput
          mt={mvs(10)}
          label="Name"
          placeholder="Enter your Name"
          value={userProfile?.fullName}
          error={validationErrors?.fullNameError}
          onChangeText={(fullName: any) =>
            handleInputChange('fullName', fullName)
          }
        />
        <View style={styles.radioButtonContainer}>
          <View style={styles.radioButtonContent}>
            <RadioButton
              value={userProfile?.gender}
              color={Colors.firstColor}
              status={userProfile?.gender === 'male' ? 'checked' : 'unchecked'}
              onPress={() => handleInputChange('gender', 'male')}
            />
            <Text style={styles.genderText}>Male</Text>
          </View>
          <View style={styles.radioButtonContent}>
            <RadioButton
              value={userProfile?.gender}
              color={Colors.firstColor}
              status={
                userProfile?.gender === 'female' ? 'checked' : 'unchecked'
              }
              onPress={() => handleInputChange('gender', 'female')}
            />
            <Text style={styles.genderText}>Female</Text>
          </View>
        </View>
        <CustomButton
          mt={mvs(20)}
          title={'Update'}
          onPress={handleUpdate}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    padding: mvs(30),
  },
  username: {
    color: Colors.firstColor,
    fontSize: mvs(22),
    fontFamily: 'Poppins-Regular',
  },
  picture: {
    backgroundColor: 'lightgrey',
    width: mvs(100),
    height: mvs(100),
    borderRadius: mvs(50),
    position: 'relative',
    borderColor: Colors.firstColor,
    borderWidth: mvs(1.5),
  },
  uploadCamera: {
    position: 'absolute',
    bottom: 0,
    left: mvs(70),
    borderRadius: mvs(50),
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: mvs(50),
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginBottom: mvs(20),
  },
  radioButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderText: {
    color: Colors.textColor,
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginRight: mvs(13),
    marginTop: mvs(5),
    minHeight: mvs(20),
  },
  errors: {
    color: Colors.errorColor,
    fontSize: mvs(13),
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    marginLeft: mvs(5),
  },
  logoutContainer: {
    backgroundColor: Colors.firstColor,
  },
  logoutIcon: {
    alignSelf: 'flex-end',
    marginRight: mvs(30),
    marginTop: mvs(5),
  },
});

export default Profile;
