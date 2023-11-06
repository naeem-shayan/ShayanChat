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
import {
  validateName,
  validateEmail,
  validatePassword,
  signup,
  validateConfirmPassword,
} from '../Contants/Utils';
import Colors from '../Contants/Colors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {mvs} from '../Config/metrices';
import CustomHeader1 from '../Components/header1';
import PageTitleAndDes from '../Components/pageTitleAndDes';
import CustomInput from '../Components/textInput';
import CustomButton from '../Components/button';

const SignupScreen = (props: any) => {
  const {navigation} = props;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [credientalError, setCredientalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    const nameErrorMessage = validateName(name);
    const emailErrorMessage = validateEmail(email);
    const passwordErrorMessage = validatePassword(password);
    const confirmPasswordErrorMessage = validateConfirmPassword(
      password,
      confirmPassword,
    );
    if (
      nameErrorMessage ||
      emailErrorMessage ||
      passwordErrorMessage ||
      confirmPasswordErrorMessage
    ) {
      setNameError(nameErrorMessage);
      setEmailError(emailErrorMessage);
      setPasswordError(passwordErrorMessage);
      setConfirmPasswordError(confirmPasswordErrorMessage);
      return;
    }
    setNameError('');
    setEmailError('');
    setPasswordError('');
    signup(name.trim(), email.trim(), password.trim(), setLoading, navigation);
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: mvs(22),
      }}>
      <CustomHeader1 onBack={() => navigation.goBack()} />
      <PageTitleAndDes
        title="Sign up with Email"
        des="Get chatting with everyone today by signing up for chat"
      />
      <CustomInput
        mt={mvs(35)}
        label="Your name"
        placeholder="Enter your name"
        value={name}
        error={nameError}
        onChangeText={(text: any) => setName(text)}
      />
      <CustomInput
        label="Your email"
        placeholder="Enter your eamil address"
        value={email}
        error={emailError}
        onChangeText={(text: any) => setEmail(text)}
      />
      <CustomInput
        label="Password"
        placeholder="********"
        password
        value={password}
        error={passwordError}
        onChangeText={(text: any) => setPassword(text)}
      />
      <CustomInput
        label="Confirm Password"
        placeholder="********"
        password
        value={confirmPassword}
        error={confirmPasswordError}
        onChangeText={(text: any) => setConfirmPassword(text)}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          mt={mvs(50)}
          mb={mvs(50)}
          loading={loading}
          title={'Create an account'}
          onPress={handleSignup}
        />
      </View>
    </KeyboardAwareScrollView>
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
    height: 175,
    width: 100,
    alignSelf: 'center',
    marginTop: 60,
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
    backgroundColor: Colors.firstColor,
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
  buttonContainer: {
    paddingHorizontal : mvs(8)
  }
});

export default SignupScreen;
