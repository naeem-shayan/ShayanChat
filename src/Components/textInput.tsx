//import liraries
import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import IconMI from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { mvs } from '../Config/metrices';
import Colors from '../Contants/Colors';

const width = Math.round(Dimensions.get('window').width);

// create a component
const CustomInput = ({
  mt,
  mb,
  label = 'Your Name',
  placeholder = '',
  value,
  onChangeText,
  password = false,
  error,
  multiline = false,
  keyboradType = 'default',
  editable = true,
  ...props
}: any) => {
  const [eye, setEye] = useState(false);
  return (
    <View
      style={{
        marginTop: mt,
        marginBottom: mb,
      }}>
      <Text
        style={{
          ...styles?.label,
          color: error ? Colors.firstColor : Colors.textLabel,
        }}>
        {label}
      </Text>
      {/* <Shadow
        inner // <- enable inner shadow
        useArt // <- set this prop to use non-native shadow on ios
        //@ts-ignore
        style={[
          styles?.shadow,
          multiline && {height: mvs(120), borderRadius: 30},
        ]}> */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input]}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholderColor}
          selectionColor={Colors.selectionColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={password && !eye}
          multiline={multiline}
          keyboardType={keyboradType}
          editable={editable}
        />
        {password && (
          <TouchableOpacity
            onPress={() => setEye(!eye)}
            style={styles.eyeContainer}>
            <IconMI
              name={eye ? 'eye' : 'eye-outline'}
              size={mvs(22)}
              color={Colors.placeholderColor}
              onPress={() => setEye(!eye)}
            />
          </TouchableOpacity>
        )}
      </View>
      {/* </Shadow> */}

      <View style={styles.errorContainer}>
        {error && (
          <Icon name="error" size={mvs(16)} color={Colors.errorColor} />
        )}
        {error && <Text style={styles.errors}>{error}</Text>}
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  input: {
    flex: 1,
    fontSize: mvs(14),
    paddingLeft: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    color: Colors.inputTextColor,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: Colors.firstColor,
  },
  errors: {
    color: Colors.errorColor,
    fontSize: mvs(13),
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
    marginLeft: mvs(5),
  },
  shadow: {
    marginTop: mvs(5),
    shadowOffset: {width: 10, height: 1},
    shadowOpacity: 1,
    shadowColor: '#AAAACC80',
    shadowRadius: 10,
    borderRadius: 40,
    backgroundColor: Colors.textInput,
    width: width - mvs(44),
    height: mvs(55),
    justifyContent: 'center',
    overflow: 'hidden',

    // ...include most of View/Layout styles
  },
  label: {
    color: Colors.textLabel,
    fontSize: mvs(15),
    fontFamily: 'Poppins-Regular',
    marginLeft: mvs(20),
    //fontWeight : 'bold'
  },
  errorContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginRight: mvs(13),
    marginTop: mvs(5),
    minHeight: mvs(20),
    //borderWidth: 1
  },
  inputContainer: {
    flexDirection: 'row',
    //borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: mvs(5),
  },
  eyeContainer: {
    //width: mvs(50),
    height: mvs(40),
    justifyContent: 'center',
    alignItems: 'center',
    right: mvs(20),
    position: 'absolute',
  },
  multilineTextInput: {
    minHeight: mvs(100),
  },
});

//make this component available to the app
export default CustomInput;
