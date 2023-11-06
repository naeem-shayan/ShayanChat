//import liraries
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';

// create a component
const PageTitleAndDes = ({title = 'Title', des = 'Description', ...props}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.des}>{des}</Text>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: mvs(30),
  },
  title: {
    fontSize: mvs(24),
    color: Colors.firstColor,
    fontFamily: 'Poppins-Medium',
  },
  des: {
    fontSize: mvs(15),
    color: Colors.textColor,
    fontFamily: 'Poppins-Regular',
  },
});

//make this component available to the app
export default PageTitleAndDes;
