import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { RadioButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setUserType } from '../Actions/userAction';
import CustomButton from '../Components/button';
import CustomHeader1 from '../Components/header1';
import PageTitleAndDes from '../Components/pageTitleAndDes';
import CustomInput from '../Components/textInput';
import { mvs } from '../Config/metrices';
import Colors from '../Contants/Colors';
import {
  signup,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from '../Contants/Utils';

const SignupScreen = (props: any) => {
  const {navigation} = props;
  const dispatch = useDispatch();

  const [selected, setSelected] = useState<any>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    dispatch(setUserType(!selected ? 'user' : 'consultant'));
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
    signup(
      name.trim(),
      email,
      password,
      setLoading,
      navigation,
      dispatch,
      !selected ? 'user' : 'consultant',
    );
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
        title="Create an account"
        des="Get chatting with everyone today by signing up for chat"
        center={true}
      />
      <Text style={styles.userTitle}>Who are you</Text>
      <View style={styles.radioButtonContainer}>
        <View style={styles.radioButtonContent}>
          <RadioButton
            value="user"
            color={Colors.firstColor}
            status={!selected ? 'checked' : 'unchecked'}
            onPress={() => setSelected(!selected)}
          />
          <Text style={styles.genderText}>User</Text>
        </View>
        <View style={styles.radioButtonContent}>
          <RadioButton
            value="consultant"
            color={Colors.firstColor}
            status={selected ? 'checked' : 'unchecked'}
            onPress={() => setSelected(!selected)}
          />
          <Text style={styles.genderText}>Consultant</Text>
        </View>
      </View>
      <CustomInput
        mt={mvs(20)}
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
          title={'SignUp'}
          onPress={handleSignup}
          onAuth={true}
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
  userTypeContainer: {alignItems: 'center'},
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: mvs(213),
    alignSelf: 'center',
    marginTop: mvs(10),
    paddingHorizontal: mvs(10),
    marginBottom: mvs(114),
  },
  tabUser: {
    fontSize: mvs(18),
    color: Colors.textColor,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    marginLeft: 15,
  },
  tabConsultantText: {
    fontSize: mvs(18),
    color: Colors.textColor,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
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
    paddingHorizontal: mvs(8),
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  radioButtonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTitle: {
    alignSelf: 'flex-start',
    marginLeft: mvs(10),
    color: Colors.textColor,
    fontSize: mvs(15),
    marginTop: mvs(20),
    fontFamily: 'Poppins-Regular',
  },
  genderText: {
    color: Colors.textColor,
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
  },
  user: {
    width: mvs(34),
    height: mvs(32),
    alignSelf: 'center',
  },
  consultant: {
    width: mvs(40),
    height: mvs(40),
    alignSelf: 'center',
  },
});

export default SignupScreen;
