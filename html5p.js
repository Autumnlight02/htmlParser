import { parse, walk, SyntaxKind } from 'html5parser';
import sample from './sample/old1.js';

console.log('e');
console.log(parse);

let a = performance.now();
const ast = parse(sample);
let b = performance.now();
console.log(b - a);
console.log(ast);
