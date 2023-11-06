import React, {useRef, useEffect, useState} from 'react';
import {Text, View, StyleSheet, Image, Pressable, Animated} from 'react-native';
import {Shadow} from 'react-native-neomorph-shadows';
import CustomButton from '../Components/button';
import Colors from '../Contants/Colors';
import {mvs} from '../Config/metrices';

const WelcomeScreen = ({navigation}:any) => {
  const [selected, setSelected] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const handleTabPress = (index: any) => {
    setSelected(index);
    Animated.timing(translateX, {
      toValue: index * mvs(112),
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleStart=()=>{
    navigation.navigate("Login")
  }

  return (
    <View style={styles.rootContainer}>
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.description}>
        {`Get Best Solution from \n our experts`}
      </Text>
      <Text style={styles.userType}>Choose who you are</Text>
      <Shadow inner useArt style={styles?.shadow}>
        <View style={styles.tabContainer}>
          <Animated.View
            style={[styles.tabIndicator, {transform: [{translateX}]}]}
          />
          <Pressable onPress={() => handleTabPress(0)} style={styles.tab}>
            <Image
              source={require('../../assests/images/user.png')}
              style={[
                styles.user,
                {tintColor: selected === 0 ? 'white' : 'black'},
              ]}
            />
          </Pressable>
          <Pressable onPress={() => handleTabPress(1)} style={styles.tab}>
            <Image
              source={require('../../assests/images/consultant.png')}
              style={[
                styles.consultant,
                {
                  tintColor: selected === 1 ? 'white' : 'black',
                },
              ]}
            />
          </Pressable>
        </View>
      </Shadow>
      <View style={styles.labelsContainer}>
        <Text style={styles.tabUser}>User</Text>
        <Text style={styles.tabConsultantText}>Consultant</Text>
      </View>
      <CustomButton title="Get Started" onPress={handleStart}/>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: mvs(50),
    alignItems: 'center',
  },
  title: {
    color: Colors.firstColor,
    fontSize: mvs(20),
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    marginTop: mvs(50),
  },
  description: {
    color: Colors.textColor,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: mvs(18),
    fontWeight: '400',
    marginTop: mvs(45),
  },
  userType: {
    color: Colors.firstColor,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    fontSize: mvs(18),
    fontWeight: '400',
    marginTop: mvs(60),
  },
  shadow: {
    shadowOffset: {width: 10, height: 1},
    shadowOpacity: 1,
    shadowColor: '#AAAACC80',
    shadowRadius: 10,
    borderRadius: 40,
    backgroundColor: Colors.textInput,
    width: mvs(200),
    height: mvs(80),
    justifyContent: 'center',
    marginTop: mvs(56),
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: mvs(200),
    alignSelf: 'center',
  },
  tab: {
    width: mvs(86),
    height: mvs(86),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicator: {
    position: 'absolute',
    height: mvs(88),
    width: mvs(88),
    backgroundColor: Colors.firstColor,
    borderRadius: 50,
  },
  user: {
    width: 34,
    height: 32,
    alignSelf: 'center',
  },
  consultant: {
    width: 40,
    height: 40,
    alignSelf: 'center',
  },
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
});

export default WelcomeScreen;
