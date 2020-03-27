// *** Get various input values ***
// NOTE: Input should be interactive unless required values are supplied in the initial command
// 1. App name
// 2. App description
// 3. Context folder
// 4. Is this the default app (used to know if deps should be installed)
// 5. Generate icons?
// 6. Theme color

// *** Read text assets ***
// 1. Get the assets main folder path
// 2. Get a list of text asset paths
// *** Interpolate text assets ***
// 1. Build an object as the interpolation data
// - Get the app name in various forms for insertion into text assets
// 2. Get the right names and paths for scripts and other assets
// 3. Merge the text and data
// *** Write text assets ***
// 1. Get the context folder path for output
// 2. Get the app name in snake case for insertion into some file and folder names
// - The icons folder name needs the app name pre-pended to it
// 3. Build all file paths for each text asset
// 4. Write all text assets to their paths

// *** Read image assets ***
// 1. Get the path in the same way there are acquired for text assets
// *** Write image assets ***
// 1. Get the output paths the same way as text assets
// 2. Just copy the files from one path to another (How to copy without loading???)

// *** Add React Related Dependencies to the Package ***
// 1. Read the package.json file
// -  Run `npm init` if there is no package.json
// 2. npm install the dependencies
// 3. npm install all

// *** Optional Icon Generation ***
// 1. Get the path to an SVG file containing an app icon
// 2. Generate png, svg and ico files from the supplied icon

export default class App {
  currentWorkingDirectory: ?string;
  baseDirectory: ?string;
  appFile: ?string;
  includeIcons: ?boolean;
  themeColor: ?string;

  doIt = () => {
    console.log(this);
  };
}

const app = new App();

app.currentWorkingDirectory = './';
app.baseDirectory = 22;
