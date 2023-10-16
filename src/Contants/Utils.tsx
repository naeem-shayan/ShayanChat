import auth from '@react-native-firebase/auth';
import {chatkitty} from '../ChatKitty';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

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
  if (password.length < 5) {
    return 'Password must be at least 5 characters';
  } else {
    return '';
  }
};

export const signin = (
  email: string,
  password: string,
  setLoading: (loading: boolean) => void,
) => {
  setLoading(true);
  auth()
    .signInWithEmailAndPassword(email.trim(), password.trim())
    .then(async userCredential => {
      const currentUser = userCredential.user;
      const result: any = await chatkitty.startSession({
        username: currentUser.uid,
        authParams: {
          idToken: await currentUser.getIdToken(),
        },
      });
      if (result.failed) {
        setLoading(false);
      } else {
        const user = {
          id: result?.session?.user?.id,
          callStatus: result?.session?.user?.callStatus,
          displayPictureUrl: result?.session?.user?.displayPictureUrl,
          name: result?.session?.user?.name,
          presence: result?.session?.user?.presence,
          properties: result?.session?.user?.properties,
        };
        firestore()
          .collection('Users')
          .doc(`${result?.session?.user?.id}`)
          .update(user)
          .then(async () => {
            await AsyncStorage.setItem('user', JSON.stringify(user));
          });
      }
    })
    .catch(error => {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error.code === 'auth/invalid-email'
            ? 'Invalid Credentials'
            : error.code === 'auth/network-request-failed'
            ? 'Please connect to internet'
            : error.code === 'auth/too-many-requests'
            ? 'To many requests, please try again later.'
            : error.code === 'auth/invalid-login'
            ? 'Invalid login credentials'
            : `${
                error.code.split('/')[1].charAt(0).toUpperCase() +
                error.code.split('/')[1].slice(1)
              }`,
      });
    });
};

export const signup = (
  name: string,
  email: string,
  password: string,
  setLoading: (loading: boolean) => void,
) => {
  setLoading(true);
  auth()
    .createUserWithEmailAndPassword(email.trim(), password.trim())
    .then(async userCredential => {
      await auth().currentUser?.updateProfile({
        displayName: name,
      });
      const currentUser = userCredential.user;
      const startSessionResult: any = await chatkitty.startSession({
        username: currentUser.uid,
        authParams: {
          idToken: await currentUser.getIdToken(),
          displayName: name,
        },
      });
      if (startSessionResult.failed) {
        setLoading(false);
      } else {
        const user = {
          id: startSessionResult?.session?.user?.id,
          callStatus: startSessionResult?.session?.user?.callStatus,
          displayName: startSessionResult?.session?.user?.displayName,
          displayPictureUrl:
            startSessionResult?.session?.user?.displayPictureUrl,
          name: startSessionResult?.session?.user?.name,
          presence: startSessionResult?.session?.user?.presence,
          properties: startSessionResult?.session?.user?.properties,
        };
        firestore()
          .collection('Users')
          .doc(`${startSessionResult?.session?.user?.id}`)
          .set(user)
          .then(async () => {
            await AsyncStorage.setItem('user', JSON.stringify(user));
          });
      }
    })
    .catch(error => {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2:
          error.code === 'auth/email-already-in-use'
            ? 'Email already in use'
            : error.code === 'auth/invalid-email'
            ? 'Invalid credentials'
            : `${
                error.code.split('/')[1].charAt(0).toUpperCase() +
                error.code.split('/')[1].slice(1)
              }`,
      });
    });
};
