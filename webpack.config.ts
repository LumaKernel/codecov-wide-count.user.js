import webpack from 'webpack';
import { validate } from 'jsonschema';
import pad from 'pad';
import npmPackage from './package.json';
import metadataSchema from './meta.schema.json';

const metadataPath = './src/meta.json';
const metadata = require(metadataPath);

interface IMetadata {
  [key: string]: string | boolean | string[];
}

const generateHeader = (metadata: IMetadata) => {
  const validateResult = validate(metadata, metadataSchema);
  if (!validateResult.valid) {
    throw new Error(`The script metadata at ${metadataPath} is not valid.\n${validateResult}`);
  }

  const lines: string[] = [];
  const padLength = Math.max(...Object.keys(metadata).map(k => k.length));
  const makeLine = (key: string, value: string) => `// @${pad(key, padLength)} ${value}`;

  lines.push('// ==UserScript==');
  for (let key of Object.keys(metadata)) {
    if (key[0] === '$') continue;
    const value = metadata[key];
    if (Array.isArray(value)) {
      for (let subValue of value) {
        lines.push(makeLine(key, subValue));
      }
    } else if (typeof (value) === 'string') {
      lines.push(makeLine(key, value));
    } else if (typeof (value) === 'boolean' && value) {
      lines.push(makeLine(key, ''));
    }
  }
  lines.push('// ==/UserScript==\n');

  return lines.join('\n');
}

export default <webpack.Configuration>{
  entry: './src/index.ts',
  output: {
    filename: `${npmPackage.name}.user.js`
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: generateHeader(metadata),
      raw: true,
      entryOnly: true
    })
  ]
};
