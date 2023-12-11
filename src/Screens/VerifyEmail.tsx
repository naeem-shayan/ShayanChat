import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import OTPTextView from 'react-native-otp-textinput';
import CustomButton from '../Components/button';
import CustomHeader1 from '../Components/header1';
import PageTitleAndDes from '../Components/pageTitleAndDes';
import firestore from '@react-native-firebase/firestore';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';
import {useDispatch, useSelector} from 'react-redux';
import {setUser} from '../Actions/userAction';
import Toast from 'react-native-toast-message';
import {onLogout} from '../Contants/Utils';
import {useIsFocused} from '@react-navigation/native';

const VerifyEmail = (props: any) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  // let otpInput: any = useRef(null);
  const {navigation} = props;
  const [loading, setLoading] = useState(false);
  const [otpInput, setOtpInput] = useState<any>('');
  const [otp, setOtp] = useState<number>();
  const [resend, setResend] = useState<boolean>(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  const user = useSelector((state: any) => state.user);

  useEffect(() => {
    if (isFocused) {
      let OTP = Math.floor(1000 + Math.random() * 9000);
      setOtp(OTP);
      fetch('https://otp.syedhussnainshah.tech/api/verify', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mail: user?.email,
          otp: `${OTP}`,
        }),
      });
    }
  }, [resend, isFocused]);

  const handleVerify = () => {
    setLoading(true);
    if (otp == otpInput) {
      firestore()
        .collection('Users')
        .doc(`${user?.id}`)
        .update({is_verified: true})
        .then(async () => {
          dispatch(setUser({...user, is_verified: true}));
          setLoading(false);
          navigation.replace('Connect');
        });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Invalid OTP',
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prevCount => prevCount - 1);
      }, 1000);
    }

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, [resendCountdown]);

  const handleResendCode = () => {
    // Implement resend code logic here
    if (resendCountdown === 0) {
      setResendCountdown(60); // Reset countdown
      setResend(!resend);
    }
  };

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: mvs(22),
      }}>
      <CustomHeader1 onBack={() => onLogout(user, dispatch, navigation)} />
      <PageTitleAndDes
        title="Verify Email"
        des={`Please enter the 4-Digit otp sent to ${user?.email}`}
      />
      <View style={styles.otpContainer}>
        <OTPTextView
          handleTextChange={res => setOtpInput(res)}
          tintColor={Colors.firstColor}
          containerStyle={{paddingHorizontal: mvs(20)}}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Text
          style={{
            ...styles.resend,
            color:
              resendCountdown === 0
                ? Colors.firstColor
                : Colors.placeholderColor,
          }}
          onPress={handleResendCode}>
          {resendCountdown === 0
            ? 'Resend Code'
            : `Resend Code in ${resendCountdown}s`}
        </Text>
        <CustomButton
          mt={mvs(20)}
          loading={loading}
          title={'Verify'}
          onPress={handleVerify}
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
    backgroundColor: 'white',
  },
  otpContainer: {marginTop: mvs(100)},
  buttonContainer: {
    paddingHorizontal: mvs(8),
    marginTop: mvs(100),
  },
  resend: {
    fontSize: mvs(15),
    color: Colors.firstColor,
    alignSelf: 'center',
    fontFamily: 'Poppins-Medium',
  },
});

export default VerifyEmail;
