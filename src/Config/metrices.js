import {Dimensions, Platform} from 'react-native';
import {PixelRatio} from 'react-native';

const width = Math.round(Dimensions.get('window').width);
const height = Math.round(Dimensions.get('window').height);

const guidelineBaseWidth = 400;
const guidelineBaseHeight = 850;

const xdHeight = xdHeight => {
  const heightPercent = Math.round((xdHeight / guidelineBaseHeight) * 100);
  return PixelRatio.roundToNearestPixel((height * heightPercent) / 100);
};
const xdWith = xdWidth => {
  const widthPercent = Math.round((xdWidth / guidelineBaseWidth) * 100);
  return PixelRatio.roundToNearestPixel((width * widthPercent) / 100);
};

const scale = size => (width / guidelineBaseWidth) * size;
const vs = size => (height / guidelineBaseHeight) * size;
const ms = (size, factor = 0.5) => size + (scale(size) - size) * factor;
const mvs = (size, factor = Platform.OS === 'android' ? 0.7 : 0.5) =>
  size + (vs(size) - size) * factor;

export {scale, vs, ms, mvs, height, width, xdHeight, xdWith};
