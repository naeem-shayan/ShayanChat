import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { mvs } from '../Config/metrices';
import Colors from '../Contants/Colors';

const CustomHeader = ({
  title,
  displayActions = false,
  userStatus,
  status,
  showBack = false,
  onCall,
  onBackPress,
}: any) => {
  return (
    <View style={styles.rootContainer}>
      <View style={{...styles.leftContainer, paddingLeft: showBack ? 0 : 15}}>
        {showBack && (
          <IconButton
            icon="arrow-left"
            size={28}
            iconColor="#ffffff"
            onPress={onBackPress}
          />
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title} ellipsizeMode="tail" numberOfLines={1}>
            {title}
          </Text>
          {userStatus && <Text style={styles.status}>{status}</Text>}
        </View>
      </View>
      {displayActions && (
        <View style={styles.rightContainer}>
          <IconButton
            icon="video"
            size={28}
            iconColor="#ffffff"
            onPress={onCall}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.firstColor,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {},
  rightContainer: {
    flexDirection: 'row',
  },
  title: {
    fontSize: mvs(20),
    color: Colors.white,
    fontWeight: '600',
    width: mvs(180),
    fontFamily: 'Poppins-Regular',
  },
  status: {
    color: Colors.white,
    fontFamily: 'Poppins-Regular',
  },
  loaderContainer: {
    height: 60,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomHeader;
