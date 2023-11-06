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
const CustomButton = ({
  loading,
  title = 'Title',
  mt,
  mb,
  onPress,
  ...props
}: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      style={{...styles.container, marginTop: mt, marginBottom: mb}}>
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
    paddingVertical: mvs(8),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.firstColor,
    borderRadius: mvs(15),
  },
  title: {
    fontSize: mvs(20),
    color: Colors.buttonText,
    fontFamily: 'Poppins-Medium',
    lineHeight : mvs(28)
  },
});

//make this component available to the app
export default CustomButton;
