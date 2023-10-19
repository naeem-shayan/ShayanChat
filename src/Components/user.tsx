import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Colors from '../Contants/Colors';

const User = ({item, onPress,...props}: any) => {

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image source={{uri: item?.displayPictureUrl}} style={styles.image} />
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.userName}>
            {item.displayName}
          </Text>
          <Text style={styles.userStatus}>{item?.presence?.online? 'online' : 'offline'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'white',
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.userStatusColor,
  },
  image: {
    height: 50,
    width: 50,
    borderRadius: 50,
  },
  contentContainer: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'column',
    width: '100%',
    marginHorizontal: 18,
  },
  userName: {
    color: Colors.textColor,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 31.5,
    width: 180,
  },
  userStatus: {
    color: Colors.userStatusColor,
    fontSize:10
  },
});

export default User;
