import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import {mvs} from '../Config/metrices';
import Colors from '../Contants/Colors';
import TrackPlayer, {
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';

const AudioPlayer = ({recordedFilePath}: any) => {
  const progress = useProgress();
  const [isPlaying, setIsPlaying] = useState(false);
  const [start, setStart] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      if (progress.position > 0 && progress.position >= progress.duration) {
        TrackPlayer.reset();
        setIsPlaying(false);
        setStart(false);
      }
    }
  }, [progress.position]);

  const onStartPlay = async () => {
    await TrackPlayer.reset();
    await TrackPlayer.add({
      url: `${recordedFilePath}`,
      artist: 'audio1',
      id: `index`,
      title: 'TakeTo Audio Playing',
      genre: 'Phish',
    });
    await TrackPlayer.play();
    setIsPlaying(true);
    setStart(true);
  };

  const onPausePlay = async () => {
    await TrackPlayer.pause();
    setIsPlaying(false);
  };

  const onPlay = async () => {
    await TrackPlayer.play();
    setIsPlaying(true);
  };

  const handleSeek = async (value: any) => {
    await TrackPlayer.seekTo(value);
  };

  return (
    <View style={styles.container}>
      {start ? (
        <Icon
          name={isPlaying ? 'pause' : 'play'}
          size={30}
          color="white"
          onPress={isPlaying ? onPausePlay : onPlay}
        />
      ) : (
        <Icon name="play" size={30} color="white" onPress={onStartPlay} />
      )}

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={progress.duration}
        value={progress.position}
        step={0.5}
        onValueChange={handleSeek}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.firstColor,
    width: '60%',
    height: mvs(60),
    borderRadius: mvs(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: mvs(10),
  },
  slider: {
    width: '100%',
    marginLeft: mvs(10),
  },
});

export default AudioPlayer;
