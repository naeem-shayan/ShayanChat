import React, {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';

const AudioRecording = ({toggleRecording}: any) => {
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds + 1);
      if (seconds === 59) {
        setMinutes(prevMinutes => prevMinutes + 1);
        setSeconds(0);
      }
    }, 1000);
    return () => clearInterval(timerRef.current ? timerRef.current : '');
  }, [seconds]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Icon name="microphone" size={30} color="white" />
        <Text style={styles.timer}>{`${
          minutes < 10 ? `0${minutes}` : minutes
        } : ${seconds < 10 ? `0${seconds}` : seconds}`}</Text>
      </View>
      <Text
        style={styles.canceTtext}
        onPress={() => {
          clearInterval(timerRef.current ? timerRef.current : '');
          toggleRecording(
            false,
          );
        }}>
        Cancel
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.firstColor,
    height: mvs(60),
    borderRadius: mvs(10),
    paddingHorizontal: mvs(10),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    justifyContent: 'space-between',
  },
  timer: {
    color: '#ffffff',
    fontSize:mvs(17),
    fontFamily: 'Poppins-Regular',
  },
  canceTtext: {
    color: '#ffffff',
    marginRight: mvs(10),
    fontSize:mvs(17),
    fontFamily: 'Poppins-Regular',
  },
});

export default AudioRecording;
