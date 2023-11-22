import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Colors from '../Contants/Colors';
import {mvs} from '../Config/metrices';
import defaultProfilePicture from '../Contants/defaultPicture';

const User = ({item, category, onPress, ...props}: any) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View>
        <Image
          source={{
            uri: item?.profilePicture
              ? item?.profilePicture
              : defaultProfilePicture,
          }}
          style={styles.image}
        />
        {item?.is_online && <View style={styles.online} />}
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.userName}>
            {item.fullName}
          </Text>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.category}>
            Category:<Text style={styles.categoryName}>{` ${category}`}</Text>
          </Text>
          <Text ellipsizeMode="tail" numberOfLines={1} style={styles.category}>
            Stauts: <Text style={styles.userStatus}>
            {item?.is_online ? 'online' : 'offline'}
          </Text>
          </Text>
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
    height: mvs(90),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: mvs(0.5),
    borderBottomColor: Colors.userStatusColor,
  },
  image: {
    height: mvs(60),
    width: mvs(60),
    borderRadius: mvs(50),
  },
  contentContainer: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'column',
    width: '100%',
    marginHorizontal: mvs(18),
  },
  userName: {
    color: Colors.textColor,
    fontSize: mvs(18),
    fontWeight: '700',
    lineHeight: mvs(31.5),
    width: mvs(180),
    fontFamily: 'Poppins-Regular',
  },
  category: {
    color: Colors.textColor,
    fontSize: mvs(12),
    fontFamily: 'Poppins-Regular',
  },
  categoryName: {
    fontSize: mvs(13),
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  userStatus: {
    color: Colors.textColor,
    fontSize: mvs(14),
    fontWeight: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  online: {
    height: mvs(12),
    width: mvs(12),
    backgroundColor: '#1EED11',
    borderRadius: 12 / 2,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});

export default User;
