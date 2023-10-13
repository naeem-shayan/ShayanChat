import React, {createContext, useState} from 'react';
// import {
//   createUserWithEmailAndPassword,
//   updateProfile,
//   signInWithEmailAndPassword
// } from 'firebase/auth/react-native';
import auth from '@react-native-firebase/auth';
import {chatkitty} from '../ChatKitty';
import Toast from 'react-native-toast-message';

export const AuthContext = createContext({});

export const AuthProvider = ({children}: any) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,
        login: async (email: any, password: any) => {
          setLoading(true);
          try {
            auth()
              .signInWithEmailAndPassword(email, password)
              .then(async userCredential => {
                const currentUser = userCredential.user;
                const result = await chatkitty.startSession({
                  username: currentUser.uid,
                  authParams: {
                    idToken: await currentUser.getIdToken(),
                  },
                });

                if (result.failed) {
                 // console.log('could not login');
                }
              })
              .catch(error => {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2:
                    error.code === 'auth/invalid-email'
                      ? 'Invalid Credentials'
                      : `${error.code}`,
                });
              });
          } catch (error) {
            //console.error(error);
          } finally {
            setLoading(false);
          }
        },

        register: async (displayName: string, email: string, password: any) => {
          setLoading(true);
          try {
            auth()
              .createUserWithEmailAndPassword(email, password)
              .then(async userCredential => {
                // Signed-in Firebase user
                const currentUser = userCredential.user;
                if (currentUser) {
                  currentUser.updateProfile({
                    displayName,
                  });
                }
                const startSessionResult = await chatkitty.startSession({
                  username: currentUser.uid,
                  authParams: {
                    idToken: await currentUser.getIdToken(),
                  },
                });
                if (startSessionResult.failed) {
                  //console.log('Could not sign up');
                }
              })
              .catch(error => {
                Toast.show({
                  type: 'error',
                  text1: 'Error',
                  text2:
                    error.code === 'auth/email-already-in-use'
                      ? 'Email already in use'
                      : error.code === 'auth/invalid-email'
                      ? 'Invalid credentials'
                      : `${error.code}`,
                });
              });
          } catch (error) {
            //console.error(error);
          } finally {
            setLoading(false);
          }
        },
        logout: async () => {
          try {
            await chatkitty.endSession();
          } catch (error) {
            //console.error(error);
          }
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};
