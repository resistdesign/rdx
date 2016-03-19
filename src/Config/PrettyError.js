export default {
  // this is a simple selector to the element that says 'Error'
  'pretty-error > header > title > kind': {
    // which we can hide:
    display: 'none'
  },

  // the 'colon' after 'Error':
  'pretty-error > header > colon': {
    // we hide that too:
    display: 'none'
  },

  // our error message
  'pretty-error > header > message': {
    // let's change its color:
    color: 'red',

    // we can use black, red, green, yellow, blue, magenta, cyan, white,
    // grey, bright-red, bright-green, bright-yellow, bright-blue,
    // bright-magenta, bright-cyan, and bright-white

    // we can also change the background color:
    background: 'grey',

    // it understands paddings too!
    padding: '0 1' // top/bottom left/right
  },

  // each trace item ...
  'pretty-error > trace > item': {
    // ... can have a margin ...
    marginLeft: 2,

    // ... and a bullet character!
    bullet: '"<grey>o</grey>"'

    // Notes on bullets:
    //
    // The string inside the quotation mark gets used as the character
    // to show for the bullet point.
    //
    // You can set its color/background color using tags.
    //
    // This example sets the background color to white, and the text color
    // to cyan, the character will be a hyphen with a space character
    // on each side:
    // example: '"<bg-white><cyan> - </cyan></bg-white>"'
    //
    // Note that we should use a margin of 3, since the bullet will be
    // 3 characters long.
  },

  'pretty-error > trace > item > header > pointer > file': {
    color: 'bright-cyan'
  },

  'pretty-error > trace > item > header > pointer > colon': {
    color: 'cyan'
  },

  'pretty-error > trace > item > header > pointer > line': {
    color: 'bright-cyan'
  },

  'pretty-error > trace > item > header > what': {
    color: 'bright-white'
  }
};