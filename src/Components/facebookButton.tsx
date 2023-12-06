import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { mvs } from '../Config/metrices';
import Colors from '../Contants/Colors';


const FacebookLoginButton = ({ onPress }:any) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.buttonContainer}>
        <Icon name="facebook" size={24} color={Colors.white} style={styles.icon} />
        <Text style={styles.buttonText}>Continue with Facebook</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1877F2',
    paddingVertical: mvs(12),
    paddingHorizontal: mvs(24),
    borderRadius: mvs(8),
  },
  buttonText: {
    color: Colors.white,
    fontSize: mvs(16),
    marginLeft: mvs(12),
  },
  icon: {
    marginRight: mvs(12),
  },
});

export default FacebookLoginButton;
