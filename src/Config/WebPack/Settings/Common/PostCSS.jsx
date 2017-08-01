import Autoprefixer from 'autoprefixer';

export default function () {
  return {
    postcss: function () {
      return [Autoprefixer];
    }
  };
}
