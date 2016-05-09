import Path from 'path';
import Command from '../Base/Command';
import Compile from './Compile';
import WebPackDevServer from 'webpack-dev-server';
import OpenURL from 'openurl';

export default class Serve extends Command {
  static DEFAULT_ENV = 'development';
  static DEFAULT_HOST = '0.0.0.0';
  static DEFAULT_PORT = 3000;

  constructor() {
    super(
      'serve',
      {
        ...Compile.HELP_DESCRIPTOR,
        '--host': 'Server host. Default: 0.0.0.0',
        '--port': 'Server port. Default: 3000',
        '--open': 'Open the default browser to the server address.'
      }
    );
  }

  async run(args) {
    await super.run(args);
    Compile.setENV(Serve.DEFAULT_ENV);
    const argConfig = Compile.processArgs(args);
    const host = args.host || Serve.DEFAULT_HOST;
    const port = args.port || Serve.DEFAULT_PORT;
    const compiler = Compile.getCompiler(
      argConfig,
      true,
      '',
      host,
      port
    );
    const open = args.open;
    const hostedUrl = `http://${host}:${port}`;

    this.log('Start', 'Serving and Compiling:', `${argConfig.targets.join(', ')}`);

    const server = new WebPackDevServer(compiler, {
      contentBase: argConfig.outputPath,
      publicPath: '/',
      hot: true,
      quiet: true,
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

    this.log('Server', 'Starting...');

    await new Promise((res, rej) => {
      server.listen(port, host, (error) => {
        if (error) {
          rej(error);
        }

        this.log('Server', 'Running on:', hostedUrl);
        res();
      });
    });

    if (open) {
      const relativeTarget = Path.relative(
        argConfig.contextPath,
        argConfig.targets[0]
        )
        .replace(/\\/g, '/');
      const initialApp = `${hostedUrl}/${relativeTarget}`;

      this.log('Opening', 'URL:', initialApp);
      OpenURL.open(initialApp);
    }
  }
}