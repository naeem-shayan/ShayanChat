import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { chatkitty } from '../ChatKitty';
import CustomButton from '../Components/button';
import CustomHeader1 from '../Components/header1';
import PageTitleAndDes from '../Components/pageTitleAndDes';
import CustomInput from '../Components/textInput';
import { mvs } from '../Config/metrices';
import Colors from '../Contants/Colors';
import {
  handleFacebookLogin,
  signin,
  validateEmail,
  validatePassword
} from '../Contants/Utils';

const LoginScreen = (props: any) => {
  const {navigation} = props;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [credientalError, setCredientalError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const userType = useSelector((state: any) => state.userType);


  const [switchValue, setSwitchValue] = useState(false);

  const toggleSwitch = () => {
    setSwitchValue(!switchValue);
  };

  useEffect(() => {
    chatkitty.endSession();
  }, []);

  const handleLogin = async () => {
    const emailErrorMessage = validateEmail(email);
    const passwordErrorMessage = validatePassword(password);
    if (emailErrorMessage || passwordErrorMessage) {
      setEmailError(emailErrorMessage);
      setPasswordError(passwordErrorMessage);
      return;
    }
    setEmailError('');
    setPasswordError('');
    signin(email, password.trim(), setLoading, navigation, dispatch, null);
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: mvs(22),
      }}>
      <CustomHeader1 onBack={() => navigation.navigate('Onboarding')} />
      <PageTitleAndDes
        title="Hello, Welcome Back"
        des="Happy to see you again, to use your account please login first."
      />
      <CustomInput
        mt={mvs(35)}
        label="Email Address"
        placeholder="Enter your email address"
        value={email}
        error={emailError}
        onChangeText={(text: any) => setEmail(text)}
      />
      <CustomInput
        label="Password"
        placeholder="Enter your password"
        password
        value={password}
        error={passwordError}
        onChangeText={(text: any) => setPassword(text)}
      />
      {/* <Text style={styles.forgot}>Forgot Password</Text> */}
      <View style={styles.buttonContainer}>
        <CustomButton
          mt={mvs(40)}
          loading={loading}
          title={'Login'}
          onPress={handleLogin}
        />
      </View>

      <Text
        style={styles.newAccountText}
        onPress={() => !loading && navigation.navigate('Signup')}>
        Don't have an account?<Text style={styles.signUp}>{` SignUp `}</Text>
      </Text>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerLabel}>Or Login with</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialButtons}>
        {/* <TouchableOpacity onPress={() => handleGoogleLogin(navigation)}>
          <Image
            source={require('../../assests/images/google.png')}
            style={styles.socialIcons}
          />
        </TouchableOpacity> */}
        <IconButton
          icon="facebook"
          size={33}
          iconColor="#4267B2"
          onPress={() => handleFacebookLogin(setLoading, navigation, userType, dispatch)}
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
    //padding: mvs(24),
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
    // borderWidth: 1,
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
    fontSize: 15,
    alignSelf: 'flex-start',
    marginLeft: 30,
  },
  newAccountText: {
    marginTop: mvs(20),
    color: Colors.textColor,
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: mvs(14),
  },
  signUp: {
    color: Colors.firstColor,
    fontFamily: 'Poppins-Medium',
    textDecorationLine:"underline"
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  socialIcons: {
    height: 40,
    width: 40,
  },
  forgot: {
    fontSize: mvs(13),
    color: Colors.firstColor,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'flex-end',
    marginTop: mvs(13),
    marginRight: mvs(8),
  },
  dividerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: mvs(60),
    //borderWidth:1
  },
  divider: {
    height: 1,
    width: mvs(100),
    borderWidth: 0.5,
    borderColor: Colors.textColor,
  },
  dividerLabel: {
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
    color: Colors.textColor,
  },
  buttonContainer: {
    paddingHorizontal: mvs(8),
  },
});

export default LoginScreen;
