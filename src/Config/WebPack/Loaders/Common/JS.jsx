import {
  BABEL_OPTIONS_PHASE_1,
  BABEL_OPTIONS_PHASE_2
} from '../../Constants/BabelOptions';
import BabelExcludes from '../../Constants/BabelExcludes';

export default function () {
  return [
    {
      test: /\.(js|jsx)$/,
      exclude: [
        ...BabelExcludes
      ],
      loader: [
        `${require.resolve('babel-loader')}?${JSON.stringify(BABEL_OPTIONS_PHASE_2)}`,
        `${require.resolve('babel-loader')}?${JSON.stringify(BABEL_OPTIONS_PHASE_1)}`
      ].join('!')
    }
  ];
}
