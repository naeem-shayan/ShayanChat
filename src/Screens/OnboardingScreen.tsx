import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import Colors from '../Contants/Colors';
import {mvs, width} from '../Config/metrices';
import PageTitleAndDes from '../Components/pageTitleAndDes';
import { Text } from 'react-native-paper';
import CustomButton from '../Components/button';

const OnboardingScreen = ({navigation}:any) => {
  
  const handleStart=async ()=>{
    navigation.navigate("Login")
  }

  return (
    <View style={styles.rootContainer}>
     <Text style={styles.title}>Get Closer To Everyone</Text>
     <Text style={styles.des}>Helps you to contact everyone with just easy way</Text>
     <Image source={require("../../assests/images/Users.png")} style={styles.image}/>
     <CustomButton title="Get Started" onPress={handleStart}/>
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
    lineHeight:mvs(44)
  },
  des: {
    fontSize: mvs(15),
    color: Colors.textColor,
    fontFamily: 'Poppins-Regular',
  },
  image:{
    height:mvs(271),
    width:mvs(262),
    marginVertical:mvs(56),
    marginBottom:mvs(120)
  }
});

export default OnboardingScreen;
