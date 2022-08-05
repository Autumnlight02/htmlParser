console.log('e');
import { parse } from 'node-html-parser';

import sample from './sample/old1.js';

let a = performance.now();
parse(sample);
let b = performance.now();

console.log(b - a);
// console.log(parsed);
