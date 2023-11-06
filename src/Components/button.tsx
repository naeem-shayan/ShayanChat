//import liraries
import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Colors from '../Contants/Colors';
import {mvs} from '../Config/metrices';

// create a component
const CustomButton = ({loading, title = 'Title', onPress, ...props}: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={styles.container}>
      {loading ? (
        <ActivityIndicator size={'small'} color={Colors.buttonText} />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    height: mvs(46),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.firstColor,
    borderRadius: mvs(15),
    width:"100%"
  },
  title: {
    fontSize: mvs(20),
    color: Colors.buttonText,
  },
});

//make this component available to the app
export default CustomButton;
