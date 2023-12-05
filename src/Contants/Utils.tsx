import auth from '@react-native-firebase/auth';
import {chatkitty} from '../ChatKitty';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';
import QB from 'quickblox-react-native-sdk';
import {
  clearUser,
  clearUserType,
  setUser,
  setUserType,
} from '../Actions/userAction';
import {sendPushNotification} from './SendPush';
import {launchImageLibrary} from 'react-native-image-picker';

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
  if (email.includes(' ')) {
    return 'Invalid Email';
  }
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

export const isValidNumber = (age: any, name: string) => {
  const ageNumber: number = parseInt(age, 10);
  if (isNaN(ageNumber) || ageNumber <= 0) {
    return `Enter valid ${name}`;
  }
  return '';
};

export const isValidDescription = (description: string) => {
  const words = description.split(/\s+/);
  if (words.length < 10) {
    return 'Description must contain at least 10 words';
  }
  return '';
};

export const replaceObjectById = (
  id: any,
  newObject: any,
  arrayOfObjects: any,
) => {
  // Find the index of the object with the specified id
  const index = arrayOfObjects?.findIndex((obj: any) => obj.id == id);
  // If the object with the given id is found, replace it
  if (index !== -1) {
    arrayOfObjects[index] = newObject;
  } else {
    arrayOfObjects = [newObject, ...arrayOfObjects];
  }
  return arrayOfObjects;
};

export const updateObjectById = (
  id: any,
  newId: any,
  type: any,
  arrayOfObjects: any,
) => {
  // Find the index of the object with the specified id
  const index = arrayOfObjects?.findIndex((obj: any) => obj.id == id);
  // If the object with the given id is found, replace it
  let updatedData: any = [];
  if (index !== -1) {
    updatedData = [
      ...arrayOfObjects.slice(0, index),
      {
        ...arrayOfObjects[index],
        deliveredIds:
          type == '@QB/MESSAGE_DELIVERED'
            ? [...arrayOfObjects[index]?.deliveredIds, newId]
            : [...arrayOfObjects[index]?.deliveredIds],
        readIds:
          type == '@QB/MESSAGE_READ'
            ? [...arrayOfObjects[index]?.readIds, newId]
            : [...arrayOfObjects[index]?.readIds],
      },
      ...arrayOfObjects.slice(index + 1),
    ];

    return updatedData;
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

export const validateConfirmPassword = (
  password: string,
  confirmPassword: string,
) => {
  if (password != confirmPassword) {
    return 'Password mismatch';
  } else {
    return '';
  }
};

const handleLogin = async (user: any, dispatch: any) => {
  firestore()
    .collection('Users')
    .doc(`${user?.id}`)
    .update(user)
    .then(async () => {
      const documentSnapshotAfter = await firestore()
        .collection('Users')
        .doc(`${user?.id}`)
        .get();
      const currentUserDataAfter = documentSnapshotAfter.data();
      dispatch(setUser(currentUserDataAfter));
      return true;
    })
    .catch(error => {
      return false;
    });
};

const handleSignup = async (user: any, dispatch: any) => {
  const updatedUser = {
    ...user,
    isProfileComplete: false,
  };
  firestore()
    .collection('Users')
    .doc(`${user?.id}`)
    .set(updatedUser)
    .then(async () => {
      dispatch(setUser(user));
      return true;
    })
    .catch(error => {
      console.error('Error', error);
      return false;
    });
};

export const signin = (
  email: string,
  password: string,
  setLoading: (loading: boolean) => void,
  navigation: any,
  dispatch: any,
  userType: any,
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
        ...(userType && {userType: userType}),
        password: password,
        is_online: true,
      };
      if (user.userType) {
        handleSignup(user, dispatch)
          .then(() => {
            setLoading(false);
            navigation.replace('Connect');
          })
          .catch(error => {
            console.error(error);
          });
        setLoading(false);
      } else {
        handleLogin(user, dispatch)
          .then(() => {
            setLoading(false);
            navigation.replace('Connect');
          })
          .catch(error => {
            console.log(error);
          });
      }
    })
    .catch(function (e) {
      console.log(e);
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
  dispatch: any,
  userType: any,
) => {
  setLoading(true);
  // get user typpe
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
      signin(email, password, setLoading, navigation, dispatch, userType);
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

export const handleFacebookLogin = async (
  setLoading: (loading: boolean) => void,
  navigation: any,
  userType: any,
  dispatch: any,
) => {
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
  QB.auth
    .loginWithFacebook(data?.accessToken)
    .then(async function (info) {
      await messaging().registerDeviceForRemoteMessages();
      const token = await messaging().getToken();
      let userData = await firestore()
        .collection('Users')
        .where('email', '==', info.user.email)
        .get();
      if (userData.docs.length > 0) {
        const user: any = {
          ...info?.user,
          token: info?.session?.token,
          deviceToken: token,
          is_online: true,
        };
        firestore()
          .collection('Users')
          .doc(`${user?.id}`)
          .update(user)
          .then(async () => {
            const documentSnapshotAfter = await firestore()
              .collection('Users')
              .doc(`${user?.id}`)
              .get();
            const updatedUser = documentSnapshotAfter.data();
            dispatch(setUser(updatedUser));
            setLoading(false);
            navigation.replace('Connect');
          })
          .catch(error => {
            setLoading(false);
          });
      } else {
        const user: any = {
          ...info?.user,
          token: info?.session?.token,
          deviceToken: token,
          userType: userType,
          socialType: 'facebook',
          is_online: true,
        };
        firestore()
          .collection('Users')
          .doc(`${user?.id}`)
          .set(user)
          .then(async () => {
            dispatch(setUser(user));
            setLoading(false);
            navigation.replace('Connect');
          })
          .catch(error => {
            setLoading(false);
          });
      }
    })
    .catch(function (e: any) {
      console.error('error', e);
    });
};

export const onLogout = async (user: any, dispatch: any, navigation: any) => {
  try {
    if (user?.socialType == 'google') {
      GoogleSignin?.revokeAccess();
      await auth().signOut();
    } else {
      QB.chat.disconnect();
      QB.auth
        .logout()
        .then(() => {
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
            .catch(error => {});
        })
        .catch(e => {
          console.log('error', e);
        });
    }
    navigation.replace('Login');
  } catch (error) {
    console.error(error);
  }
};

export const updateQuickBlockUser = (updateduserProfile: any) => {
  QB.users
    .update(updateduserProfile)
    .then(function (updatedUser) {
    })
    .catch(function (e) {
      console.error('Error in updating user====', e);
    });
};

export const sendMessage = async (
  messageType: any,
  content: any,
  user: any,
  setMessages: any,
  dialog: any,
  setNewMessage: any,
  friend: any,
  setSending: any,
  minutes?: any,
  seconds?: any,
) => {
  let newMsg: any = {};

  if (messageType === 'text') {
    if (content.trim() === '') {
      return;
    }

    newMsg = {
      id: Date.now(),
      body: `${content}`,
      properties: {
        type: 'text',
        status: 'sending',
      },
      senderId: user?.id,
    };
  } else if (messageType === 'audio') {
    newMsg = {
      id: Date.now(),
      body: 'loading',
      properties: {
        type: 'audio',
        url: '',
      },
      senderId: user?.id,
    };
  } else {
    newMsg = {
      id: Date.now(),
      body: 'loading',
      properties: {
        type: messageType,
        url: '',
      },
      senderId: user?.id,
    };
  }

  setMessages((prevMessages: any) => [newMsg, ...prevMessages]);
  setNewMessage('');

  if (messageType === 'text') {
    const message = {
      dialogId: dialog?.id,
      body: content,
      properties: {
        type: 'text',
        id: `${newMsg?.id}`,
        status: 'sent',
      },
      saveToHistory: true,
    };
    QB.chat.sendMessage(message);
    sendPushNotification(friend?.deviceToken, {
      title: user?.fullName,
      body: message?.body,
    });
  } else if (messageType === 'audio') {
    const contentUploadParams = {
      url: content,
      public: false,
    };


    QB.content
      .upload(contentUploadParams)
      .then(async (file: any) => {
        const {uid} = file;
        const contentGetFileUrlParams = {uid};
        const url = await QB.content.getPrivateURL(contentGetFileUrlParams);
        const message = {
          dialogId: dialog?.id,
          body: 'Attachment',
          saveToHistory: true,
          properties: {
            type: 'audio',
            url: url,
            id: `${newMsg?.id}`,
            duration: `${minutes} : ${seconds}`,
          },
        };
        QB.chat.sendMessage(message);
        setSending(false);
        sendPushNotification(friend?.deviceToken, {
          title: user?.fullName,
          body: 'Attachment',
        });
      })
      .catch(function (e) {
        console.log('incatch=========', e);
        setSending(false);
      });
  } else {
    const result: any = await launchImageLibrary({mediaType: messageType});
    if (!result?.didCancel) {
      setSending(true);

      const contentUploadParams = {
        url: result?.assets[0]?.uri,
        public: false,
      };

      QB.content
        .upload(contentUploadParams)
        .then(async (file: any) => {
          const {uid} = file;
          const contentGetFileUrlParams = {uid};
          const url = await QB.content.getPrivateURL(contentGetFileUrlParams);

          const message = {
            dialogId: dialog?.id,
            body: 'Attachment',
            saveToHistory: true,
            properties: {
              type: file?.contentType.includes('image')
                ? 'photo'
                : file?.contentType.includes('video')
                ? 'video'
                : 'file',
              url: url,
              id: `${newMsg?.id}`,
            },
          };

          QB.chat.sendMessage(message);
          setSending(false);
          sendPushNotification(friend?.deviceToken, {
            title: user?.fullName,
            body: 'Attachment',
          });
        })
        .catch(function (e) {
          setSending(false);
        });
    }
  }
};
