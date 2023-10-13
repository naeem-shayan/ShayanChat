import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {validateName, validateEmail, validatePassword} from '../Contants/Utils';
import Colors from '../Contants/Colors';
import {AuthContext} from '../Context/authProvider';
import {chatkitty} from '../ChatKitty';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

const SignupScreen = (props: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [credientalError, setCredientalError] = useState('');
  const [loading, setLoading] = useState(false);
  const {register}: any = useContext(AuthContext);

  const signup = () => {
    const nameErrorMessage = validateName(name);
    const emailErrorMessage = validateEmail(email);
    const passwordErrorMessage = validatePassword(password);
    if (nameErrorMessage || emailErrorMessage || passwordErrorMessage) {
      setNameError(nameErrorMessage);
      setEmailError(emailErrorMessage);
      setPasswordError(passwordErrorMessage);
      return;
    }
    setNameError('');
    setEmailError('');
    setPasswordError('');
    //register(name, email.trim(), password.trim());
    setLoading(true);
    auth()
      .createUserWithEmailAndPassword(email.trim(), password.trim())
      .then(async userCredential => {
        // Signed-in Firebase user
        const currentUser = userCredential.user;
        if (currentUser) {
          currentUser.updateProfile({
            displayName: name,
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
          setLoading(false);
        } else {
          setCredientalError('');
          setLoading(false);
          props.navigation.navigate('HomeScreen');
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
              : `${error.code}`,
        });
      });
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{paddingBottom: 50}}
          showsVerticalScrollIndicator={false}>
          <Image
            source={require('../../assests/images/logo.jpg')}
            style={styles.image}
          />
          <Text style={styles.title}>Signup Here</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={{
                ...styles.input,
                borderColor: nameError ? 'red' : Colors.firstColor,
              }}
              placeholder="Enter your Name"
              placeholderTextColor={Colors.placeholderColor}
              selectionColor={Colors.selectionColor}
              value={name}
              onChangeText={text => setName(text)}
            />
            {nameError && <Text style={styles.errors}>{nameError}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={{
                ...styles.input,
                borderColor: emailError ? 'red' : Colors.firstColor,
              }}
              placeholder="Enter your Email"
              placeholderTextColor={Colors.placeholderColor}
              selectionColor={Colors.selectionColor}
              value={email}
              keyboardType="email-address"
              onChangeText={text => setEmail(text)}
            />
            {emailError && <Text style={styles.errors}>{emailError}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={{
                ...styles.input,
                borderColor: passwordError ? 'red' : Colors.firstColor,
              }}
              placeholder="Enter your Password"
              placeholderTextColor={Colors.placeholderColor}
              selectionColor={Colors.selectionColor}
              value={password}
              secureTextEntry
              onChangeText={text => setPassword(text)}
            />
            {passwordError && (
              <Text style={styles.errors}>{passwordError}</Text>
            )}
          </View>
          {credientalError && (
            <Text style={styles.errors}>{credientalError}</Text>
          )}
          <TouchableOpacity
            disabled={loading}
            style={styles.signupButton}
            onPress={signup}>
            {loading ? (
              <ActivityIndicator size={'small'} color={Colors.white} />
            ) : (
              <Text style={styles.signupText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  image: {
    backgroundColor: 'transparent',
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.textColor,
    marginTop: 60,
    marginBottom: '10%',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: Colors.firstColor,
    padding: 16,
    borderWidth: 0.5,
    borderRadius: 16,
    color: Colors.textColor,
  },
  signupButton: {
    width: '90%',
    height: 48,
    borderRadius: 16,
    borderColor: Colors.firstColor,
    backgroundColor: Colors.secondColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '5%',
    alignSelf: 'center',
  },
  signupText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errors: {
    color: Colors.errorColor,
    fontSize: 12,
    marginLeft: 30,
    alignSelf: 'flex-start',
  },
});

export default SignupScreen;
