import Autoprefixer from 'autoprefixer';

export default function (contextPath, outputPath) {
  return {
    postcss: function () {
      return [Autoprefixer];
    }
  };
}
