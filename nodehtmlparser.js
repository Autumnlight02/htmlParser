console.log('e');
import { parse } from 'node-html-parser';

import sample from './sample/1.js';

let a = performance.now();
const parsed = parse(sample);
let b = performance.now();

console.log(b - a);
console.log(parsed);
