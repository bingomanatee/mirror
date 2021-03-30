import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import sizes from 'rollup-plugin-sizes';

const plugins = [
  resolve(),
  commonjs(),
  terser(),
  sizes(),
];
if (process.env.NODE_ENV === 'test') {
  console.log('un-terse for testing')
  plugins.splice(2, 1);
}

const pkg = require('./package.json')
const name = pkg.name.replace('-', '_');

module.exports = {
  input: 'src/index.js',
  plugins,
  output: {
    file: 'lib/index.js',
    format: 'umd',
    name: name,
  },
};
