//@ts-ignore
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

var Benchmark = require('benchmark');

var suite = new Benchmark.Suite();

import sample from '../sample/1.js';

import parseHTML from './index.js';

import { parse } from 'node-html-parser';

suite
  .add('ma parser', function () {
    parseHTML(sample);
  })
  .add('enemy parser', function () {
    const parsed = parse(sample);
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
