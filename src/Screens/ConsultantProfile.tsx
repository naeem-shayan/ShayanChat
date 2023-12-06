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
import categoriesList from '../Contants/catergoriesJSON';
import {RadioButton} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import {useDispatch, useSelector} from 'react-redux';
import {isValidDescription, isValidNumber, onLogout} from '../Contants/Utils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import {setUser} from '../Actions/userAction';
import storage from '@react-native-firebase/storage';
import {IconButton} from 'react-native-paper';
import {useIsFocused} from '@react-navigation/native';
import countries from '../Contants/countriesJSON';
import defaultProfilePicture from '../Contants/defaultPicture';

const width = Math.round(Dimensions.get('window').width);

const ConsultantProfile = ({navigation}: any) => {
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const isFoucs = useIsFocused();

  const [consultantProfile, setConsultantProfile] = useState({
    age: null,
    gender: 'male',
    country: user?.country || '',
    category: user?.category || '',
    experience: null,
    profilePicture: user?.profilePicture || defaultProfilePicture,
    rate: null,
    description: user?.description || '',
  });
  const [validationErrors, setValidationErrors] = useState({
    ageError: '',
    rateError: '',
    experienceError: '',
    descriptionError: '',
    categoryError: '',
    countryError: '',
    imageError: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isFoucs) {
      setConsultantProfile({
        age: user?.age || 0,
        gender: user?.gender || 'male',
        country: user?.country || '',
        category: user?.category || '',
        experience: user?.experience || 0,
        profilePicture: user?.profilePicture || defaultProfilePicture,
        rate: user?.rate || 0,
        description: user?.description || '',
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

  const categoryOptions = categoriesList
    .map(category => ({
      label: category?.name,
      value: category?.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const handleInputChange = (field: string, value: any) => {
    setConsultantProfile({...consultantProfile, [field]: value});
  };

  const checkValidationsErrors = () => {
    const ageError = isValidNumber(consultantProfile.age, 'age');
    const rateError = isValidNumber(consultantProfile.rate, 'rate');
    const experienceError = isValidNumber(
      consultantProfile.experience,
      'experience',
    );
    const descriptionError = isValidDescription(consultantProfile.description);
    let categoryError = '';
    let countryError = '';
    let imageError = '';
    if (!consultantProfile.category) {
      categoryError = 'Category is required';
    }
    if (!consultantProfile.country) {
      countryError = 'Country is required';
    }
    if (!consultantProfile.profilePicture) {
      imageError = 'Profile Pic is required';
    }
    if (
      ageError ||
      rateError ||
      experienceError ||
      categoryError ||
      countryError ||
      descriptionError
    ) {
      setValidationErrors({
        ageError,
        rateError,
        experienceError,
        descriptionError,
        categoryError,
        countryError,
        imageError,
      });
      return false;
    }
    return true;
  };

  const clearErrors = () => {
    setLoading(true);
    setValidationErrors({
      ageError: '',
      rateError: '',
      experienceError: '',
      descriptionError: '',
      categoryError: '',
      countryError: '',
      imageError: '',
    });
  };

  const handleUpdate = () => {
    if (checkValidationsErrors()) {
      clearErrors();
      const updatedConsultantProfile = {
        ...user,
        ...consultantProfile,
        isProfileComplete: true,
      };
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
          setLoading(false);
          Alert.alert(
            user?.isProfileComplete
              ? 'Your profile has been updated successfully'
              : 'Your profile has been completed successfully',
          );
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
    <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
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
                uri: consultantProfile?.profilePicture,
              }}
              style={styles.image}
            />
          </View>
          <View style={styles.cameraWrapper}>
            <Icons
              name="camera"
              color={'black'}
              size={mvs(30)}
              onPress={handleImageUpload}
            />
          </View>
        </View>
        <View style={[styles.errorContainer, {alignSelf: 'center'}]}>
          {validationErrors?.imageError && (
            <Icon name="error" size={mvs(16)} color={Colors.errorColor} />
          )}
          {validationErrors?.imageError && (
            <Text style={styles.errors}>{validationErrors?.imageError}</Text>
          )}
        </View>
        <Text style={styles.username} ellipsizeMode='tail' numberOfLines={1}>{user?.fullName}</Text>
        <CustomInput
          mt={mvs(10)}
          label="Age"
          placeholder="Enter your Age in years, e.g 40"
          value={consultantProfile?.age}
          error={validationErrors?.ageError}
          keyboradType="numeric"
          onChangeText={(age: any) => handleInputChange('age', age)}
        />
        <CustomInput
          label="Experience"
          placeholder="Enter your experience in years, e.g 5"
          value={consultantProfile?.experience}
          error={validationErrors?.experienceError}
          keyboradType="numeric"
          onChangeText={(experience: any) =>
            handleInputChange('experience', experience)
          }
        />
        <CustomInput
          label="Rate"
          placeholder="Enter your rate per hour, e.g 500"
          value={consultantProfile?.rate}
          error={validationErrors?.rateError}
          keyboradType="numeric"
          onChangeText={(rate: any) => handleInputChange('rate', rate)}
        />

        <View style={styles.dropdownContainer}>
          <Dropdown
            data={categoryOptions}
            mode="modal"
            labelField="label"
            valueField="value"
            placeholder="Select category"
            value={consultantProfile?.category}
            onChange={(item: any) => handleInputChange('category', item.value)}
            style={styles.dropdownValue}
            containerStyle={styles.dropdownMenu}
          />
        </View>
        <View style={styles.errorContainer}>
          {validationErrors?.categoryError && (
            <Icon name="error" size={mvs(16)} color={Colors.errorColor} />
          )}
          {validationErrors?.categoryError && (
            <Text style={styles.errors}>{validationErrors?.categoryError}</Text>
          )}
        </View>
        <View style={styles.dropdownContainer}>
          <Dropdown
            data={countries}
            mode="modal"
            labelField="label"
            valueField="value"
            placeholder="Select country"
            value={consultantProfile?.country}
            onChange={(item: any) => handleInputChange('country', item.value)}
            style={styles.dropdownValue}
            containerStyle={styles.dropdownMenu}
          />
        </View>
        <View style={styles.errorContainer}>
          {validationErrors?.countryError && (
            <Icon name="error" size={mvs(16)} color={Colors.errorColor} />
          )}
          {validationErrors?.countryError && (
            <Text style={styles.errors}>{validationErrors?.countryError}</Text>
          )}
        </View>
        <Text style={styles.genderTitle}>Gender</Text>
        <View style={styles.radioButtonContainer}>
          <View style={styles.radioButtonContent}>
            <RadioButton
              value={consultantProfile?.gender}
              color={Colors.firstColor}
              status={
                consultantProfile?.gender === 'male' ? 'checked' : 'unchecked'
              }
              onPress={() => handleInputChange('gender', 'male')}
            />
            <Text style={styles.genderText}>Male</Text>
          </View>
          <View style={styles.radioButtonContent}>
            <RadioButton
              value={consultantProfile?.gender}
              color={Colors.firstColor}
              status={
                consultantProfile?.gender === 'female' ? 'checked' : 'unchecked'
              }
              onPress={() => handleInputChange('gender', 'female')}
            />
            <Text style={styles.genderText}>Female</Text>
          </View>
        </View>
        <CustomInput
          label="Description"
          placeholder="Enter your description"
          value={consultantProfile?.description}
          error={validationErrors?.descriptionError}
          multiline={true}
          shownumericKeyboard={true}
          onChangeText={(description: any) =>
            handleInputChange('description', description)
          }
        />
        <CustomButton
          mt={mvs(20)}
          title={user?.isProfileComplete ? 'Update Profile' :'Complete Profile'}
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
    width: mvs(250),
    textAlign: 'center',
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
  cameraWrapper: {
    height: mvs(45),
    width: mvs(45),
    backgroundColor: Colors.firstColor,
    position: 'absolute',
    bottom: 0,
    left: mvs(60),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
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
  genderTitle:{
    alignSelf:"flex-start",
    marginLeft:mvs(10),
    color:Colors.textColor,
    fontSize:mvs(15),
    marginBottom:mvs(20),
    fontFamily: 'Poppins-Regular',
  },
  genderText: {
    color: Colors.textColor,
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
  },
  dropdownContainer: {
    backgroundColor: 'white',
    width: '100%',
    marginVertical: mvs(10),
  },
  dropdownValue: {
    borderColor: '#AAAACC80',
    borderWidth: 1,
    borderRadius: mvs(15),
    height: mvs(50),
    paddingHorizontal: mvs(15),
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
  dropdownMenu: {
    marginBottom: mvs(20),
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

export default ConsultantProfile;
