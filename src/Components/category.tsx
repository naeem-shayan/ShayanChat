import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';

const CategoryCard = ({name, image, onPress}: any) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Image source={{uri: image}} style={styles.image} />
        <Text numberOfLines={1} style={styles.text}>
          {name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: mvs(180),
    height: mvs(140),
    margin: mvs(10),
    borderRadius: mvs(10),
    overflow: 'hidden',
    borderWidth: mvs(0.6),
    borderColor: Colors.firstColor,
  },
  image: {
    width: '100%',
    height: mvs(100),
    //borderRadius: mvs(10),
  },
  text: {
    color: Colors.firstColor,
    fontSize: mvs(20),
    textAlign: 'left',
    marginLeft: mvs(5),
    fontFamily: 'Poppins-Regular',
    width: mvs(120),
    marginTop: mvs(5),
  },
});

export default CategoryCard;
