import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {IconButton} from 'react-native-paper';
import Colors from '../Contants/Colors';
import {ActivityIndicator} from 'react-native';

const CustomHeader = ({
  title,
  displayActions = false,
  userStatus,
  status,
  showBack = false,
  loading,
  navigation,
  onAddPress,
  onLogoutPress,
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
          <Text style={styles.title}>{title}</Text>
          {userStatus && <Text style={styles.status}>{status? 'online' : 'Offline'}</Text>}
        </View>
      </View>
      {displayActions && (
        <View style={styles.rightContainer}>
          <IconButton
            icon="plus"
            size={28}
            iconColor="#ffffff"
            onPress={onAddPress}
          />
          <View style={styles.loaderContainer}>
            {loading ? (
              <ActivityIndicator size={'small'} color={Colors.white} />
            ) : (
              <IconButton
                icon="logout"
                size={28}
                iconColor="#ffffff"
                onPress={onLogoutPress}
              />
            )}
          </View>
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
    fontSize: 22,
    color: Colors.white,
    fontWeight: '600',
  },
  status: {
    color : Colors.white
  },
  loaderContainer: {
    height: 60,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomHeader;
