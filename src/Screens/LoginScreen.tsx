import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Colors from '../Contants/Colors';
import {signin, validateEmail, validatePassword} from '../Contants/Utils';
import {AuthContext} from '../Context/authProvider';

const LoginScreen = (props: any) => {
  const {navigation} = props;
  const {login}: any = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [credientalError, setCredientalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    const emailErrorMessage = validateEmail(email);
    const passwordErrorMessage = validatePassword(password);
    if (emailErrorMessage || passwordErrorMessage) {
      setEmailError(emailErrorMessage);
      setPasswordError(passwordErrorMessage);
      return;
    }
    setEmailError('');
    setPasswordError('');
    signin(email.trim(), password.trim(), setLoading);
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{paddingBottom: 60}}
          showsVerticalScrollIndicator={false}>
          <Image
            source={require('../../assests/images/logo.png')}
            style={styles.image}
          />
          <Text style={styles.title}>Login Here</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={{
                ...styles.input,
                borderColor: emailError ? 'red' : Colors.firstColor,
              }}
              placeholder="Enter your Email"
              placeholderTextColor={Colors.placeholderColor}
              selectionColor={Colors.selectionColor}
              value={email}
              onChangeText={text => setEmail(text)}
            />
            {emailError && <Text style={styles.errors}>{emailError}</Text>}
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={{
                ...styles.input,
                borderColor: passwordError ? 'red' : Colors.firstColor,
              }}
              placeholder="Enter your Password"
              placeholderTextColor={Colors.placeholderColor}
              selectionColor={Colors.selectionColor}
              value={password}
              secureTextEntry
              onChangeText={text => setPassword(text)}
            />
            {passwordError && (
              <Text style={styles.errors}>{passwordError}</Text>
            )}
          </View>
          {credientalError && (
            <Text style={styles.errors}>{credientalError}</Text>
          )}
          <TouchableOpacity
            disabled={loading}
            style={styles.signupButton}
            onPress={handleLogin}>
            {loading ? (
              <ActivityIndicator size={'small'} color={Colors.white} />
            ) : (
              <Text style={styles.signupText}>Login</Text>
            )}
          </TouchableOpacity>
          <Text
            style={styles.newAccountText}
            onPress={() => !loading && navigation.navigate('Signup')}>
            Create new account
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  image: {
    backgroundColor: 'transparent',
    resizeMode: 'cover',
    height: 175,
    width: 100,
    alignSelf: 'center',
    marginTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.textColor,
    marginTop: 60,
    marginBottom: '10%',
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
    backgroundColor: Colors.firstColor,
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

export default LoginScreen;
