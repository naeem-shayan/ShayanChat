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
import citiesList from '../Contants/citiesJSON';
import {RadioButton} from 'react-native-paper';
import {Dropdown} from 'react-native-element-dropdown';
import {useDispatch, useSelector} from 'react-redux';
import {isValidDescription, isValidNumber} from '../Contants/Utils';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import {setUser} from '../Actions/userAction';
import storage from '@react-native-firebase/storage';
import CustomHeader from '../Components/header';
import QB from 'quickblox-react-native-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {clearUser, clearUserType} from '../Actions/userAction';
import auth from '@react-native-firebase/auth';



const width = Math.round(Dimensions.get('window').width);

const ConsultantProfile = ({navigation}:any) => {
  const user = useSelector((state: any) => state.user);
  const [profilePicture, setProfilePicture] = useState<any>('');
  const [rate, setRate] = useState(0);
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState<string>('male');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [experience, setExperience] = useState<number | null>(null);
  const [city, setCity] = useState<string>(user?.city || '');
  const [ageError, setAgeError] = useState('');
  const [rateError, setRateError] = useState('');
  const [experienceError, setExperienceError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [cityError, setCityError] = useState('');
  const [imageError, setImageError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      setRate(user?.rate || 0);
      setAge(user?.age || 0);
      setGender(user?.gender || 'male');
      setDescription(user?.description || '');
      setCategory(user?.category || '');
      setExperience(user?.experience || 0);
      setCity(user?.city || '');
      setProfilePicture(user?.profilePicture || '');
    }
  }, [user]);

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
            setProfilePicture(url);
          })
          .catch(e => console.error(e));
      });
    }
  };

  const categoryOptions = categoriesList.map(category => ({
    label: category.name,
    value: category.name,
  }));

  const handleUpdate = () => {
    const ageError = isValidNumber(age, 'age');
    const rateError = isValidNumber(rate, 'rate');
    const experienceError = isValidNumber(experience, 'experience');
    const descriptionError = isValidDescription(description);
    let categoryError = '';
    let cityError = '';
    let imageError = '';
    if (!category) {
      categoryError = 'Category is required';
    }
    if (!city) {
      cityError = 'City is required';
    }
    if (!profilePicture) {
      imageError = 'Profile Pic is required';
    }
    if (
      ageError ||
      rateError ||
      experienceError ||
      categoryError ||
      cityError ||
      descriptionError
    ) {
      setAgeError(ageError);
      setRateError(rateError);
      setExperienceError(experienceError);
      setDescriptionError(descriptionError);
      setCategoryError(categoryError);
      setCityError(cityError);
      setImageError(imageError);
      return;
    } else {
      setLoading(true);
      setAgeError('');
      setRateError('');
      setExperienceError('');
      setDescriptionError('');
      setCategoryError('');
      setCityError('');
      setImageError('');
      const updatedObject = {
        ...user,
        age,
        gender,
        profilePicture,
        experience,
        rate,
        category,
        city,
        description,
        isProfileComplete: true,
      };
      firestore()
        .collection('Users')
        .doc(`${user?.id}`)
        .update(updatedObject)
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


  const onLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.clear();
      if (user?.socialType == 'google') {
        GoogleSignin?.revokeAccess();
        await auth().signOut();
      } else {

        QB.chat.disconnect();
        QB.auth
          .logout()
          .then(() => {
            setLoading(false);
            dispatch(clearUser());
            dispatch(clearUserType());
            firestore()
              .collection('Users')
              .doc(`${user?.id}`)
              .update({
                is_online: false,
                deviceToken: '',
              })
              .then(async () => {
                navigation.replace('Login');
              })
              .catch(error => {
                setLoading(false);
              });
          })
          .catch(e => {});
      }
      setLoading(false);
      navigation.replace('Login');
    } catch (error) {
      setLoading(false);
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
          onPress: async () => onLogout(),
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
      <CustomHeader logout={true} onLogoutPress={handleLogoutPress}/>
      <View style={styles.rootContainer}>
        <View>
          <View style={styles.picture}>
            {profilePicture && (
              <Image source={{uri: profilePicture}} style={styles.image} />
            )}
          </View>
          <Icons
            name="camera"
            color={Colors.firstColor}
            size={35}
            style={styles.uploadCamera}
            onPress={handleImageUpload}
          />
        </View>
        <View style={[styles.errorContainer, {alignSelf: 'center'}]}>
          {imageError && (
            <Icon name="error" size={mvs(16)} color={Colors.errorColor} />
          )}
          {imageError && <Text style={styles.errors}>{imageError}</Text>}
        </View>
        <Text style={styles.username}>{user?.fullName}</Text>
        <CustomInput
          mt={mvs(10)}
          label="Age"
          placeholder="Enter your Age in years"
          value={age.toString()}
          error={ageError}
          showNumericKeyboard={true}
          onChangeText={(text: any) => setAge(text)}
        />
        <CustomInput
          label="Experience"
          placeholder="Enter your experience in years like 10"
          value={experience?.toString()}
          error={experienceError}
          showNumericKeyboard={true}
          onChangeText={(text: any) => setExperience(text)}
        />
        <CustomInput
          label="Rate"
          placeholder="Enter your rate per hour"
          value={rate.toString()}
          error={rateError}
          showNumericKeyboard={true}
          onChangeText={(text: any) => setRate(text)}
        />

        <View style={styles.dropdownContainer}>
          <Dropdown
            data={categoryOptions}
            mode="modal"
            labelField="label"
            valueField="value"
            placeholder="Select category"
            value={category}
            onChange={item => setCategory(item.value)}
            style={styles.dropdownValue}
            containerStyle={styles.dropdownMenu}
          />
        </View>
        <View style={styles.errorContainer}>
          {categoryError && (
            <Icon name="error" size={mvs(16)} color={Colors.errorColor} />
          )}
          {categoryError && <Text style={styles.errors}>{categoryError}</Text>}
        </View>
        <View style={styles.dropdownContainer}>
          <Dropdown
            data={citiesList}
            mode="modal"
            labelField="label"
            valueField="value"
            placeholder="Select city"
            value={city}
            onChange={item => setCity(item.value)}
            style={styles.dropdownValue}
            containerStyle={styles.dropdownMenu}
          />
        </View>
        <View style={styles.errorContainer}>
          {cityError && (
            <Icon name="error" size={mvs(16)} color={Colors.errorColor} />
          )}
          {cityError && <Text style={styles.errors}>{cityError}</Text>}
        </View>
        <View style={styles.radioButtonContainer}>
          <View style={styles.radioButtonContent}>
            <RadioButton
              value={gender}
              color={Colors.firstColor}
              status={gender === 'male' ? 'checked' : 'unchecked'}
              onPress={() => setGender('male')}
            />
            <Text style={styles.genderText}>Male</Text>
          </View>
          <View style={styles.radioButtonContent}>
            <RadioButton
              value={gender}
              color={Colors.firstColor}
              status={gender === 'female' ? 'checked' : 'unchecked'}
              onPress={() => setGender('female')}
            />
            <Text style={styles.genderText}>Female</Text>
          </View>
        </View>
        <CustomInput
          label="Description"
          placeholder="Enter your description"
          value={description}
          error={descriptionError}
          multiline={true}
          shownumericKeyboard={true}
          onChangeText={(text: any) => setDescription(text)}
        />
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
  dropdownMenu:{
    marginBottom:mvs(20)
  }
});

export default ConsultantProfile;
