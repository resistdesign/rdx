import StyleLoader from 'style-loader';

// TRICKY: Style Loader should not be cached because
// if it is then it doesn't load styles on the first compile.
const oldPitch = StyleLoader.pitch;
StyleLoader.pitch = function (remainingRequest) {
  this.cacheable = () => {
  };
  return oldPitch(remainingRequest);
};

export default StyleLoader;
