'use strict';
(() => {
  // sample/1.js
  var test = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
  <script>
  console.log("hello")
    //comment <<<<<>>>>>>>>>>>
    console.log(document)
    <\/script>
    <script att="true">console.log("hello")<\/script>
    <div class="hello he<<<<>>>>>>>>>>>>>llo2" meh>
    <div>hel>>>>>>>>>>>lo</div>
    <input class="yoyo" idk="true" while='"false"' />
    </div>
    </body>
    </html>
  `;
  var __default = test;

  // src/newMainExperiment.ts
  var a = performance.now();
  parseHTML(__default);
  var b = performance.now();
  console.log(b - a);
  function returnMatchesArray(regex, string) {
    const matchingLetters = string.matchAll(regex);
    let nextValue = matchingLetters.next();
    const result = [];
    while (nextValue.value !== void 0) {
      result.push(nextValue.value.index);
      nextValue = matchingLetters.next();
    }
    return result;
  }
  function returnSingleTag() {
    return true;
  }
  function parseHTML(rawString) {
    let initedScripts = false;
    let rawStringTagOpener, rawStringTagCloser;
    function initScripts() {
      rawStringTagOpener = returnMatchesArray(/</g, rawString);
      rawStringTagCloser = returnMatchesArray(/>/g, rawString);
    }
    const tagEvents = {
      'script': () => {
        if (initedScripts === false) {
          initScripts();
          initedScripts = true;
        }
        let scriptOpener = rawStringTagCloser[closerIndex] + 1;
        let scriptCloser = rawString.indexOf('</script>', rawStringTagOpener[openerIndex]);
        createContainerizedTextElement(rawString.slice(scriptOpener, scriptCloser));
        skip = true;
      },
      'style': () => {},
      '!--': () => {
        attributeString = '';
        let commentOpener = tagOpener[openerIndex] + 5;
        let commentEnd = string.indexOf('-->', tagOpener[openerIndex]);
        createContainerizedTextElement(string.slice(commentOpener, commentEnd));
        console.log(commentOpener, commentEnd);
        return true;
      },
      'img': returnSingleTag,
      'area': returnSingleTag,
      'base': returnSingleTag,
      'br': returnSingleTag,
      'col': returnSingleTag,
      'command': returnSingleTag,
      'embed': returnSingleTag,
      'hr': returnSingleTag,
      'input': returnSingleTag,
      'keygen': returnSingleTag,
      'link': returnSingleTag,
      'meta': returnSingleTag,
      'param': returnSingleTag,
      'source': returnSingleTag,
      'track': returnSingleTag,
      'wbr': returnSingleTag,
    };
    let attributeString;
    const performanceReadings = {
      total: [0, 0],
      stringFormatting: [0, 0],
      tagsContainer: [0, 0],
    };
    performanceReadings.total[0] = performance.now();
    performanceReadings.stringFormatting[0] = performance.now();
    let string = rawString.trim();
    string = string.replace(/\n */g, ' ');
    string = string.replace(/> *</g, '><');
    string = string.replace(/ *>/g, '>');
    string = string.replace(/< */g, '<');
    string = string.replace(/<!--/g, '<!-- ');
    performanceReadings.stringFormatting[1] = performance.now();
    const tagOpener = returnMatchesArray(/</g, string);
    const tagCloser = returnMatchesArray(/>/g, string);
    function checkIfTagEvent(tag) {
      var _a;
      return (_a = tagEvents[tag]) == null ? void 0 : _a.call(tagEvents);
    }
    const finalElement = { elementType: 'root', attributes: {}, children: [] };
    [1, 2, 7, 8, 5];
    const currentPath = [finalElement];
    let currentPathDepth = 0;
    let openerIndex = 0,
      closerIndex = 0,
      skip = false;
    if (string.indexOf('!') === 1) {
      openerIndex++;
      closerIndex++;
    }
    for (; openerIndex < tagOpener.length; openerIndex++, closerIndex++) {
      indexElement(tagOpener[openerIndex] + 1, tagCloser[closerIndex]);
      if (skip === false && string.indexOf('>', tagCloser[closerIndex]) + 1 < tagOpener[openerIndex + 1]) {
        const text = string.slice(tagCloser[closerIndex] + 1, tagOpener[openerIndex + 1]);
        createTextElement(text);
      }
      skip = false;
    }
    function createTextElement(text) {
      const currElementParent = currentPath[currentPathDepth];
      currElementParent.children.push({
        elementType: 'textContent',
        textContent: text,
      });
      if (text.includes('>')) {
        if (text.length < 120) {
          let pos = text.indexOf('>');
          while (pos > -1) {
            pos = text.indexOf('>', pos + 1);
            closerIndex++;
          }
        } else {
          closerIndex = closerIndex + text.split('>').length - 1;
        }
      }
    }
    function createContainerizedTextElement(text) {
      const currElementParent = currentPath[currentPathDepth];
      currElementParent.children.push({
        elementType: 'textContent',
        textContent: text,
      });
      if (text.length < 120) {
        if (text.includes('>')) {
          let pos = text.indexOf('>');
          while (pos > -1) {
            pos = text.indexOf('>', pos + 1);
            closerIndex++;
          }
        }
        if (text.includes('<')) {
          let pos = text.indexOf('<');
          while (pos > -1) {
            pos = text.indexOf('<', pos + 1);
            openerIndex++;
          }
        }
      } else {
        if (text.includes('<')) {
          openerIndex = openerIndex + text.split('<').length - 1;
        }
        if (text.includes('>')) {
          closerIndex = closerIndex + text.split('>').length - 1;
        }
      }
    }
    function indexElement(tagBeginningGlobalIndex, tagEndingGlobalIndex) {
      const tagString = string.slice(tagBeginningGlobalIndex, tagEndingGlobalIndex);
      let singleTag = false;
      if (tagString.indexOf('/') === 0) {
        currentPathDepth--;
        return;
      }
      const tagNameEnd = getFirstTagNameEndingChar();
      const elementType = tagString.slice(0, tagNameEnd);
      const attributes = {};
      const elementObject = {
        elementType,
        attributes,
        children: [],
      };
      currentPathDepth++;
      currentPath[currentPathDepth] = elementObject;
      const parentObject = currentPath[currentPathDepth - 1];
      parentObject.children.push(elementObject);
      attributeString = tagString.slice(tagNameEnd).trim();
      if (checkIfTagEvent(elementObject.elementType) === true) {
        currentPathDepth--;
        singleTag = true;
        attributeString = attributeString.slice(0, attributeString.length - 1);
      }
      if (attributeString !== '') {
        let currentIndex = 0;
        let safeGuard = 0;
        while (attributeString.slice(currentIndex, attributeString.length) !== '') {
          safeGuard++;
          if (safeGuard === 10) {
            break;
          }
          let nextValidSeperatorIndex;
          let nextValidSeperator;
          const one = attributeString.indexOf(' ', currentIndex);
          const second = attributeString.indexOf('=', currentIndex);
          if (second !== -1) {
            if (one !== -1) {
              if (one < second) {
                nextValidSeperatorIndex = one;
                nextValidSeperator = ' ';
              }
              nextValidSeperatorIndex = second;
              nextValidSeperator = '=';
            }
            nextValidSeperatorIndex = second;
            nextValidSeperator = '=';
          } else if (one !== -1) {
            nextValidSeperatorIndex = one;
            nextValidSeperator = ' ';
          } else {
            nextValidSeperatorIndex = attributeString.length;
          }
          let attributeContent = '';
          let attributeName = attributeString.slice(currentIndex, nextValidSeperatorIndex);
          currentIndex = nextValidSeperatorIndex;
          if (nextValidSeperator === '=') {
            const seperatorCharacter = attributeString.slice(nextValidSeperatorIndex + 1, nextValidSeperatorIndex + 2);
            currentIndex = nextValidSeperatorIndex + 2;
            if (seperatorCharacter === "'" || seperatorCharacter === '"') {
              let attributeContentEndIndex = attributeString.indexOf(seperatorCharacter, currentIndex);
              currentIndex = attributeContentEndIndex + 2;
              if (attributeContentEndIndex === -1) {
                currentIndex = attributeString.length;
                while (attributeContentEndIndex === -1) {
                  closerIndex++;
                  attributeString = string.slice(tagBeginningGlobalIndex + tagNameEnd, tagCloser[closerIndex]).trim();
                  attributeContentEndIndex = attributeString.indexOf(seperatorCharacter, currentIndex);
                }
                if (singleTag) {
                  attributeString = attributeString.slice(0).trim();
                }
              }
              attributeContent = attributeString.slice(nextValidSeperatorIndex + 2, attributeContentEndIndex);
              currentIndex = attributeContentEndIndex + 2;
            }
          }
          attributes[attributeName] = attributeContent;
        }
        let pos = attributeString.indexOf('<');
        while (pos > -1) {
          pos = attributeString.indexOf('<', pos + 1);
          openerIndex++;
        }
      }
      function getFirstTagNameEndingChar() {
        const one = tagString.indexOf(' ');
        const second = tagString.indexOf('/');
        if (second !== -1) {
          if (one !== -1) {
            if (one < second) {
              return one;
            }
            return second;
          }
          return second;
        }
        if (one !== -1) {
          return one;
        }
        return tagString.length;
      }
    }
    performanceReadings.total[1] = performance.now();
  }
})();

