import auth from '@react-native-firebase/auth';
import {chatkitty} from '../ChatKitty';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import QB from 'quickblox-react-native-sdk';

export const validateName = (name: string) => {
  if (!name) {
    return 'Enter Your Name';
  }
  if (name.length < 5) {
    return 'Name should be at least 5 characters';
  } else {
    return '';
  }
};

export const validateEmail = (email: string) => {
  if (!email) {
    return 'Enter Your Email';
  }
  const validEmailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!validEmailPattern.test(email.trim())) {
    return 'Invalid email';
  } else {
    return '';
  }
};

export const validatePassword = (password: string) => {
  if (!password) {
    return 'Enter Your Password';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  } else {
    return '';
  }
};

export const signin = (
  email: string,
  password: string,
  setLoading: (loading: boolean) => void,
  navigation: any,
) => {
  setLoading(true);
  QB.auth
    .login({
      login: email,
      password: password,
    })
    .then(async function (info) {
      // signed in successfully, handle info as necessary
      // info.user - user information
      // info.session - current session
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      const user: any = {
        ...info?.user,
        deviceToken: token,
        userType: 'email',
        password: password,
        is_online: true,
      };
      firestore()
        .collection('Users')
        .doc(`${user?.id}`)
        .set(user)
        .then(async () => {
          await AsyncStorage.setItem('user', JSON.stringify(user));
          setLoading(false);
          navigation.replace('Connect');
        })
        .catch(error => {
          setLoading(false);
        });
    })
    .catch(function (e) {
      console.log(e)
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid login credentials',
      });
      setLoading(false);
      // handle error
    });
};

export const signup = (
  name: string,
  email: string,
  password: string,
  setLoading: (loading: boolean) => void,
  navigation: any,
) => {
  setLoading(true);
  const createUserParams = {
    email: email,
    fullName: name,
    login: email,
    password: password,
    id: 1,
  };
  QB.users
    .create(createUserParams)
    .then(async function (user) {
      // user created successfully
      signin(email, password, setLoading, navigation);
    })
    .catch(function (e) {
      // handle as necessary
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Email already in use',
      });
      setLoading(false);
    });
};

export const handleGoogleLogin = async (navigation: any) => {
  const {idToken} = await GoogleSignin.signIn();
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  auth()
    .signInWithCredential(googleCredential)
    .then(async res => {
      const token = await auth().currentUser?.getIdToken();
      await messaging().registerDeviceForRemoteMessages();
      const deviceToken = await messaging().getToken();
      const user = {
        uid: res.user.uid,
        idToken: token,
        displayName: res.user.displayName,
        deviceToken,
        userType: 'google',
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      navigation.replace('Connect');
    })
    .catch(error => console.log('error: ' + error));
};

export const handleFacebookLogin = async (navigation: any) => {
  const result = await LoginManager.logInWithPermissions([
    'public_profile',
    'email',
  ]);
  if (result.isCancelled) {
    throw 'User cancelled the login process';
  }
  const data = await AccessToken.getCurrentAccessToken();
  if (!data) {
    throw 'Something went wrong obtaining access token';
  }
  const facebookCredential = auth.FacebookAuthProvider.credential(
    data.accessToken,
  );
  auth()
    .signInWithCredential(facebookCredential)
    .then(async res => {
      const currentUser = await auth().currentUser;
      const token = await currentUser?.getIdToken();
      await messaging().registerDeviceForRemoteMessages();
      const deviceToken = await messaging().getToken();
      const user = {
        uid: currentUser?.uid,
        idToken: token,
        displayName: currentUser?.displayName,
        deviceToken,
        userType: 'facebook',
      };
      await AsyncStorage.setItem('user', JSON.stringify(user));
      navigation.replace('Connect');
    })
    .catch(error => console.log('Error', error));
};
