import React, {useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {IconButton, Title} from 'react-native-paper';
import {chatkitty} from '../ChatKitty';
import Colors from '../Contants/Colors';

export default function CreateChannelScreen({navigation}: any) {
  const [channelName, setChannelName] = useState('');
  const [channelError, setChannelError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleButtonPress() {
    if (channelName.length > 0) {
      chatkitty
        .createChannel({
          type: 'PUBLIC',
          name: channelName,
        })
        .then(() => navigation.navigate('HomeScreen'));
    }
  }

  return (
    <View style={styles.rootContainer}>
      <View style={styles.closeButtonContainer}>
        <IconButton
          icon="close-circle"
          size={36}
          iconColor={Colors.firstColor}
          onPress={() => navigation.goBack()}
        />
      </View>
      <View style={styles.innerContainer}>
        <Title style={styles.title}>Create a new channel</Title>
        <View style={styles.inputContainer}>
          <TextInput
            style={{
              ...styles.input,
              borderColor: channelError ? 'red' : Colors.firstColor,
            }}
            placeholder="Channel Name"
            placeholderTextColor={Colors.placeholderColor}
            selectionColor={Colors.selectionColor}
            value={channelName}
            onChangeText={text => setChannelName(text)}
          />
          {channelError && <Text style={styles.errors}>{channelError}</Text>}
        </View>
        <TouchableOpacity
          disabled={loading}
          style={styles.signupButton}
          onPress={() => handleButtonPress()}>
          {loading ? (
            <ActivityIndicator size={'small'} color={Colors.white} />
          ) : (
            <Text style={styles.signupText}>Create</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 0,
    zIndex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  buttonLabel: {
    fontSize: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: Colors.firstColor,
    padding: 16,
    borderWidth: 0.5,
    borderRadius: 16,
    color: Colors.textColor,
  },
  signupButton: {
    width: '90%',
    height: 48,
    borderRadius: 16,
    // borderWidth: 1,
    borderColor: Colors.firstColor,
    backgroundColor: Colors.secondColor,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '5%',
    alignSelf: 'center',
  },
  signupText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  errors: {
    color: Colors.errorColor,
    fontSize: 15,
    alignSelf: 'flex-start',
    marginLeft: 30,
  },
  newAccountText: {
    margin: 20,
    color: Colors.textColor,
    alignSelf: 'center',
  },
});
