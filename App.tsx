import Navigation from './src/Navigator/Navigation';
import Toast from 'react-native-toast-message';
import {PersistGate} from 'redux-persist/integration/react';
import {PaperProvider} from 'react-native-paper';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useEffect, useState} from 'react';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import Colors from './src/Contants/Colors';
import QB from 'quickblox-react-native-sdk';
import {Provider} from 'react-redux';
import {store, persistor} from './src/Store/store';
import {NativeEventEmitter, Platform} from 'react-native';
import IncommingCall from './src/Components/incommingCall';
import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

console.warn = () => {};
GoogleSignin.configure({
  webClientId:
    '9475515452-vlaj16b1r27sqf8joap26ca240cse5va.apps.googleusercontent.com',
});

const requiredPermissions = [
  Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.CAMERA
    : PERMISSIONS.IOS.CAMERA,
  Platform.OS === 'android'
    ? PERMISSIONS.ANDROID.RECORD_AUDIO
    : PERMISSIONS.IOS.MICROPHONE,
];

function App(): JSX.Element {
  const [timer, setTimer] = useState(0);
  const [call, setCall] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [timeInterval, setTimeInterval] = useState<any>(null);
  const toastConfig = {success: () => <></>};
  //@ts-ignore
  const emitter = new NativeEventEmitter(QB.webrtc);

  useEffect(() => {
    checkCameraAndMicrophonePermissions();
  }, []);

  useEffect(() => {
    Object.keys(QB.webrtc.EVENT_TYPE).forEach(key => {
      //@ts-ignore
      emitter.addListener(QB.webrtc.EVENT_TYPE[key], eventHandler);
    });

    return () => {
      Object.keys(QB.webrtc.EVENT_TYPE).forEach(key => {
        //@ts-ignore
        emitter.removeAllListeners(QB.webrtc.EVENT_TYPE[key]);
      });
    };
  }, []);

  function eventHandler(event: any) {
    const {type, payload} = event;
    const {userId, session} = payload;
    if (type == '@QB/CALL') {
      setIncomingCall(session);
    } else if (type == '@QB/CALL_END' || type == '@QB/HANG_UP') {
      //setTimer(0);
      setCall(null);
      setIncomingCall(null);
    }
  }

  const startTimer = () => {
    const intervalId = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);

    setTimeInterval(intervalId);
  };

  const stopTimer = () => {
    setTimer(0);
    clearInterval(timeInterval);
  };

  const answerCall = () => {
    const acceptParams = {
      sessionId: incomingCall?.id,
      userInfo: {},
    };
    QB.webrtc
      .accept(acceptParams)
      .then(function (session) {
        console.log('CALL:::', JSON.stringify(session));
        setCall(session);
        startTimer();
      })
      .catch(function (e) {
        /* handle error */
      });
  };

  const rejectCall = () => {
    const rejectParams = {
      sessionId: incomingCall?.id,
      userInfo: {},
    };
    QB.webrtc
      .reject(rejectParams)
      .then(function (session) {
        stopTimer();
        setCall(null);
        setIncomingCall(null);
      })
      .catch(function (e) {
        /* handle error */
      });
  };

  const endCall = () => {
    const rejectParams = {
      sessionId: incomingCall?.id,
      userInfo: {},
    };
    QB.webrtc
      .hangUp(rejectParams)
      .then(function (session) {
        stopTimer();
        setCall(null);
        setIncomingCall(null);
      })
      .catch(function (e) {
        /* handle error */
      });
  };

  const checkCameraAndMicrophonePermissions = async () => {
    try {
      const permissionStatus = await checkMultiple(requiredPermissions);
      if (
        permissionStatus[requiredPermissions[0]] === RESULTS.GRANTED &&
        permissionStatus[requiredPermissions[1]] === RESULTS.GRANTED
      ) {
        console.log(
          'Both camera and microphone permissions are already granted.',
        );
      } else {
        console.log('Camera and/or microphone permissions are not granted.');
        requestCameraAndMicrophonePermissions();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestCameraAndMicrophonePermissions = async () => {
    try {
      const permissionStatus = await requestMultiple(requiredPermissions);
      if (
        permissionStatus[requiredPermissions[0]] === RESULTS.GRANTED &&
        permissionStatus[requiredPermissions[1]] === RESULTS.GRANTED
      ) {
        console.log('Camera and microphone permissions granted successfully.');
      } else {
        console.log('Camera and/or microphone permissions denied.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <SafeAreaView
            style={{flex: 1, backgroundColor: Colors.white}}
            edges={{bottom: 'off', top: 'maximum'}}>
            <PaperProvider>
              <Navigation />
              <Toast config={toastConfig} />
            </PaperProvider>
          </SafeAreaView>
        </SafeAreaProvider>
        {incomingCall && (
          <IncommingCall
            call={call}
            timer={timer}
            answerCall={answerCall}
            rejectCall={rejectCall}
            endCall={endCall}
          />
        )}
      </PersistGate>
    </Provider>
  );
}

export default App;
