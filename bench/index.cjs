const fs = require('fs');
const path = require('path');

// importing parser
(async () => {
  const main = await import('./myparser.js');
  const parseHTML = main.default;
  // console.log(parseHTML.default);
  const { parse } = require('html5parser');

  const directoryPath = path.join(__dirname, 'input/');
  console.log(directoryPath);
  let results = [];
  fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }

    //listing all files using forEach
    let results = [];
    let results2 = [];

    files.forEach(function (file) {
      file = fs.readFileSync(directoryPath + file, 'utf-8');
      benchIt(file, results, results2);
    });

    const initialValue = 0;
    results = results.reduce((previousValue, currentValue) => previousValue + currentValue, initialValue);
    results2 = results2.reduce((previousValue, currentValue) => previousValue + currentValue, initialValue);
    console.log('myparser');
    console.log(results);
    console.log('enemyparser');
    console.log(results2);
  });

  function benchIt(file, results, results2) {
    let c = performance.now();
    parse(file);
    let d = performance.now();
    results2.push(d - c);
    //
    let a = performance.now();
    parseHTML(file);
    let b = performance.now();
    results.push(b - a);
    //
  }
})();
