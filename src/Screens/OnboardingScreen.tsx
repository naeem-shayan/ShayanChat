import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Colors from '../Contants/Colors';
import {mvs, width} from '../Config/metrices';
import PageTitleAndDes from '../Components/pageTitleAndDes';
import CustomButton from '../Components/button';
import {OnBoardingUers} from '../../assests/svgs';

const OnboardingScreen = ({navigation}: any) => {
  const handleStart = async () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>Get Closer To Everyone</Text>
      <Text style={styles.des}>
        {`Helps you to contact everyone with \njust easy way`}
      </Text>
      <View style={styles.image}>
        <OnBoardingUers height={mvs(300)} width={mvs(300)} />
      </View>
      <CustomButton title="Get Started" onPress={handleStart} />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: mvs(50),
    // alignItems: 'center',
  },
  title: {
    fontSize: mvs(36),
    color: Colors.firstColor,
    fontFamily: 'Poppins-SemiBold',
    lineHeight: mvs(44),
  },
  des: {
    fontSize: mvs(15),
    color: Colors.textColor,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    marginTop: mvs(9),
  },
  image: {
    marginVertical: mvs(56),
    marginBottom: mvs(120),
  },
});

export default OnboardingScreen;
