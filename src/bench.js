import Benchmark from 'benchmark';

var suite = new Benchmark.Suite();

//@ts-ignore
import sample from '../sample/1.js';

import parseHTML from './index.js';
import parseHTML2 from './index3.js';
//@ts-ignore
import { parse } from 'node-html-parser';

suite
  .add('parser Version 1', function () {
    parseHTML2(sample);
  })
  .add('parser Version 2', function () {
    parseHTML(sample);
  })
  .add('enemy parser', function () {
    const parsed = parse(sample);
  })
  //@ts-ignore
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    //@ts-ignore
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();

// let arr = [];
// for (let i = 0; i < 1000; i++) {
//   if (i % 10 === 0) {
//     console.log(i);
//   }
//   let a = performance.now();
//   // parseHTML(sample);
//   parse(sample);
//   let b = performance.now();
//   arr.push(b - a);
// }

// let total = 0;
// for (let i = 0; i < arr.length; i++) {
//   total += arr[i];
// }
// // console.log(arr);
// console.log(total / arr.length + 'ms');

