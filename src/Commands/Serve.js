import Command from '../Base/Command';
import Compile from './Compile';
import WebPackDevServer from 'webpack-dev-server';
import OpenURL from 'openurl';

export default class Serve extends Command {
  static DEFAULT_HOST = '0.0.0.0';
  static DEFAULT_PORT = 3000;

  constructor() {
    super(
      'serve',
      {
        ...Compile.HELP_DESCRIPTOR,
        '--host=': 'Server host. Default: 0.0.0.0',
        '--port=': 'Server port. Default: 3000',
        '--open': 'Open the default browser to the server address.'
      }
    );
  }

  async run(args) {
    await super.run(args);
    const argConfig = Compile.processArgs(args);
    const compiler = Compile.getCompiler(argConfig);
    const host = args.host || Serve.DEFAULT_HOST;
    const port = args.port || Serve.DEFAULT_PORT;
    const open = args.open;
    const hostedUrl = `http://${host}:${port}`;

    this.log('Start', 'Serving and Compiling:', `${argConfig.targets.join(', ')}`);

    const server = new WebPackDevServer(compiler, {
      contentBase: argConfig.outputPath,
      inline: true,
      hot: true,
      quiet: false,
      noInfo: true,
      watchOptions: {
        aggregateTimeout: 300,
        poll: 500
      },
      stats: {
        colors: true
      },
      historyApiFallback: true
    });

    this.log('Start', 'Server');

    await new Promise((res, rej) => {
      server.listen(port, host, function (error) {
        if (error) {
          rej(error);
        }

        this.log('Serve', 'Running on:', hostedUrl);
        res();
      });
    });

    if (open) {
      this.log('Opening', 'URL:', hostedUrl);
      OpenURL.open(hostedUrl);
    }
  }
}