import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { mvs } from '../Config/metrices';
import Colors from '../Contants/Colors';

const SheetData = ({handleSendMessage}: any) => {
  return (
    <>
      <Text style={styles.actionIconText}>Choose file to send</Text>
      <View style={styles.actionIconContainer}>
        <Pressable
          style={styles.actionIconWrapper}
          onPress={() => {
            handleSendMessage('photo');
          }}>
          <FontAwesomeIcon name="image" color={Colors.white} size={mvs(30)} />
        </Pressable>
        <Pressable
          style={styles.actionIconWrapper}
          onPress={() => {
            handleSendMessage('video');
          }}>
          <FontAwesomeIcon
            name="file-video-o"
            color={Colors.white}
            size={mvs(30)}
          />
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  actionIconText: {
    textAlign: 'center',
    marginTop: mvs(10),
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
    color: Colors.textColor,
  },
  actionIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: mvs(10),
  },
  actionIconWrapper: {
    backgroundColor: Colors.firstColor,
    height: mvs(60),
    width: mvs(60),
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: mvs(20),
    marginHorizontal: mvs(5),
  },
});

export default SheetData;
