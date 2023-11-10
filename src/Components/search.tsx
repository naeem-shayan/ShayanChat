//import liraries
import React, {useRef} from 'react';
import {View, StyleSheet, Dimensions, TouchableOpacity} from 'react-native';
import {Shadow} from 'react-native-neomorph-shadows';
import {mvs} from '../Config/metrices';
import {TextInput} from 'react-native';
import Colors from '../Contants/Colors';
import IconMI from 'react-native-vector-icons/MaterialCommunityIcons';

const width = Math.round(Dimensions.get('window').width);

// create a component
const CustomSearch = ({
  mt,
  mb,
  placeholder = '',
  onChangeText,
  ...props
}: any) => {
  const inputRef = useRef<TextInput | null>(null);
  const clearTextInput = () => {
    if (inputRef.current) {
      inputRef.current.clear();
    }
  };
  return (
    <View
      style={{
        marginTop: mt,
        marginBottom: mvs(mb),
        marginLeft: mvs(20),
      }}>
      <Shadow
        inner // <- enable inner shadow
        useArt // <- set this prop to use non-native shadow on ios
        style={styles?.shadow}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.placeholderColor}
            selectionColor={Colors.selectionColor}
            onChangeText={onChangeText}
          />
          <TouchableOpacity
            style={styles.eyeContainer}
            onPress={clearTextInput}>
            <IconMI
              name="close"
              size={mvs(22)}
              color={Colors.placeholderColor}
              onPress={clearTextInput}
            />
          </TouchableOpacity>
        </View>
      </Shadow>
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
    borderRadius: 16,
    backgroundColor: 'transparent',
    color: Colors.inputTextColor,
    fontFamily: 'Poppins-Regular',
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
  },
  eyeContainer: {
    width: mvs(50),
    height: mvs(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: mvs(20),
  },
});

//make this component available to the app
export default CustomSearch;
