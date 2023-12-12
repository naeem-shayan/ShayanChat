import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { Dropdown } from 'react-native-element-dropdown';
import { launchImageLibrary } from 'react-native-image-picker';
import { IconButton, RadioButton } from 'react-native-paper';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {setUser} from '../Actions/userAction';
import CustomButton from '../Components/button';
import CustomInput from '../Components/textInput';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';
import {
  isValidCNIC,
  isValidDateOfBirth,
  isValidDescription,
  isValidExperience,
  isValidNumber,
  onLogout,
  updateFirestoreUser,
} from '../Contants/Utils';
import categoriesList from '../Contants/catergoriesJSON';
import countries from '../Contants/countriesJSON';
import defaultProfilePicture from '../Contants/defaultPicture';

const width = Math.round(Dimensions.get('window').width);

const ConsultantProfile = ({navigation}: any) => {
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const isFoucs = useIsFocused();

  const [consultantProfile, setConsultantProfile] = useState({
    dateOfBirth: user?.dateOfBirth || new Date(),
    cnic: user?.cnic || null,
    age: user?.age || null,
    gender: 'male',
    country: user?.country || '',
    category: user?.category || '',
    experience: user?.experience ||  null,
    profilePicture: user?.profilePicture || defaultProfilePicture,
    rate: user?.rate || null,
    description: user?.description || '',
  });
  const [validationErrors, setValidationErrors] = useState({
    dateOfBirthError:'',
    cnicError: '',
    rateError: '',
    experienceError: '',
    descriptionError: '',
    categoryError: '',
    countryError: '',
    imageError: '',
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user && isFoucs) {
      setConsultantProfile({
        dateOfBirth: user?.dateOfBirth || new Date(),
        cnic: user?.cnic || 0,
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
    if (field === 'dateOfBirth') {
      const formattedDate = moment(value).format('YYYY-MM-DD');
      setConsultantProfile({ ...consultantProfile, [field]: formattedDate });
    } else {
      setConsultantProfile({ ...consultantProfile, [field]: value });
    }
  };

  const checkValidationsErrors = () => {
    const dateOfBirthError = isValidDateOfBirth(consultantProfile?.dateOfBirth);
    const rateError = isValidNumber(consultantProfile?.rate, 'rate');
    const experienceError = isValidExperience(
      consultantProfile?.dateOfBirth,
      consultantProfile?.experience,
    );
    const descriptionError = isValidDescription(consultantProfile?.description);
    const cnicError = isValidCNIC(consultantProfile?.cnic);
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
      dateOfBirthError ||
      cnicError ||
      rateError ||
      experienceError ||
      categoryError ||
      countryError ||
      descriptionError
    ) {
      setValidationErrors({
        dateOfBirthError,
        cnicError,
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
    setValidationErrors({
      dateOfBirthError:'',
      cnicError: '',
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
      setLoading(true);
      const updatedConsultantProfile = {
        ...user,
        ...consultantProfile,
        isProfileComplete: true,
      };
      updateFirestoreUser(user?.id, updatedConsultantProfile, dispatch)
        .then(() => {
          setLoading(false);
          Alert.alert(
            user?.isProfileComplete
              ? 'Your profile has been updated successfully'
              : 'Your profile has been completed successfully',
          );
        })
        .catch(() => {
          setLoading(false);
          console.error('error in updating user');
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
        <View style={styles.picture}>
          <Image
            source={{
              uri: consultantProfile?.profilePicture,
            }}
            style={styles.image}
          />
          <View style={styles.cameraWrapper}>
            <Icons
              name="camera"
              color={Colors.white}
              size={mvs(20)}
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
        <CustomInput
          mt={mvs(10)}
          editable={false}
          label="Full Name"
          placeholder="Full Name"
          value={user?.fullName}
        />
        <CustomInput
          label="CNIC"
          placeholder="Enter your CNIC, e.g 4467134567657"
          value={consultantProfile?.cnic}
          onChangeText={(cnic: any) => handleInputChange('cnic', cnic)}
          error={validationErrors?.cnicError}
          keyboradType="numeric"
          editable={!user?.isProfileComplete}
        />
        <Text style={styles.label}>Date of birth</Text>
        <Pressable style={styles.input} onPress={() => setOpen(!open)}>
          <Text
            style={[
              styles.datePlaceholder,
              {
                color:
                  moment(consultantProfile?.dateOfBirth).format(
                    'YYYY-MM-DD',
                  ) === moment(new Date()).format('YYYY-MM-DD')
                    ? Colors?.placeholderColor
                    : Colors?.textColor,
              },
            ]}>
            {moment(consultantProfile?.dateOfBirth).format('YYYY-MM-DD') ===
            moment(new Date()).format('YYYY-MM-DD')
              ? 'Enter your date of birth'
              : moment(consultantProfile?.dateOfBirth).format('YYYY-MM-DD')}
          </Text>
        </Pressable>
        <DatePicker
          modal
          open={open}
          date={new Date()}
          maximumDate={new Date()}
          mode="date"
          onConfirm={date => {
            handleInputChange('dateOfBirth', date);
            setOpen(false);
          }}
          onCancel={() => {
            setOpen(false);
          }}
        />
        <View style={styles.errorContainer}>
          {validationErrors?.dateOfBirthError && (
            <Icon name="error" size={mvs(16)} color={Colors.errorColor} />
          )}
          {validationErrors?.dateOfBirthError && (
            <Text style={styles.errors}>
              {validationErrors?.dateOfBirthError}
            </Text>
          )}
        </View>
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
          placeholder="Enter your rate per hour in dollars, e.g 500"
          value={consultantProfile?.rate}
          error={validationErrors?.rateError}
          keyboradType="numeric"
          onChangeText={(rate: any) => handleInputChange('rate', rate)}
        />

        <View style={styles.dropdownContainer}>
          <Text style={[styles.title, {marginBottom: mvs(5)}]}>Category</Text>
          <Dropdown
            data={categoryOptions}
            mode="modal"
            labelField="label"
            valueField="value"
            placeholder="Select category"
            selectedTextStyle={styles.selectValueStyle}
            value={consultantProfile?.category}
            onChange={(item: any) => handleInputChange('category', item.value)}
            style={styles.dropdownValue}
            containerStyle={styles.dropdownMenu}
            disable={user?.isProfileComplete}
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
          <Text style={styles.title}>Country</Text>
          <Dropdown
            data={countries}
            mode="modal"
            labelField="label"
            valueField="value"
            placeholder="Select country"
            value={consultantProfile?.country}
            selectedTextStyle={styles.selectValueStyle}
            onChange={(item: any) => handleInputChange('country', item.value)}
            style={styles.dropdownValue}
            containerStyle={styles.dropdownMenu}
            disable={user?.isProfileComplete}
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
          title={
            user?.isProfileComplete ? 'Update Profile' : 'Complete Profile'
          }
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
    //alignItems: 'center',
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
    //borderWidth: mvs(1.5),
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  cameraWrapper: {
    height: mvs(35),
    width: mvs(35),
    backgroundColor: Colors.firstColor,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
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
  genderTitle: {
    alignSelf: 'flex-start',
    marginLeft: mvs(10),
    color: Colors.textColor,
    fontSize: mvs(15),
    marginBottom: mvs(20),
    fontFamily: 'Poppins-Regular',
  },
  title: {
    color: Colors.textColor,
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
    marginLeft: mvs(20),
    marginBottom: mvs(5),
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
    borderWidth: 1,
    borderRadius: 10,
    height: mvs(55),
    paddingHorizontal: mvs(15),
    color: Colors.inputTextColor,
    fontFamily: 'Poppins-Regular',
    borderColor: Colors.firstColor,
    paddingLeft: 20,
  },
  selectValueStyle: {
    color: Colors.textColor,
    fontFamily: 'Poppins-Regular',
    fontSize: mvs(13),
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
  input: {
    flex: 1,
    justifyContent: 'center',
    fontSize: mvs(14),
    paddingLeft: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    color: Colors.inputTextColor,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: Colors.firstColor,
    height: mvs(55),
    marginTop: mvs(5),
    marginBottom: mvs(2),
  },
  label: {
    color: Colors.textLabel,
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
    marginLeft: mvs(20),
  },
  datePlaceholder: {
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
  },
});

export default ConsultantProfile;
