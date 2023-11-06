//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';
import Icon from 'react-native-vector-icons/Ionicons'

// create a component
const CustomHeader1 = ({onBack}: any) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.arrowContainer}>
        <Icon name='arrow-back' size={mvs(22)} color={Colors.white}/>
      </TouchableOpacity>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    //borderWidth: 1,
    paddingVertical: mvs(31),
  },
  arrowContainer: {
    height: mvs(37),
    width: mvs(37),
    borderRadius: mvs(37 / 2),
    backgroundColor: Colors.firstColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

//make this component available to the app
export default CustomHeader1;
