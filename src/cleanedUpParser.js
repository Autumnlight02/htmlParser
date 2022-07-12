'use strict';
// src/cleanedUpParser.ts
var singleTag = false;
var tagEvents = {
  '!--': () => {
    singleTag = true;
  },
  'img': () => {
    singleTag = true;
  },
  'area': () => {
    singleTag = true;
  },
  'base': () => {
    singleTag = true;
  },
  'br': () => {
    singleTag = true;
  },
  'col': () => {
    singleTag = true;
  },
  'command': () => {
    singleTag = true;
  },
  'embed': () => {
    singleTag = true;
  },
  'hr': () => {
    singleTag = true;
  },
  'input': () => {
    singleTag = true;
  },
  'keygen': () => {
    singleTag = true;
  },
  'link': () => {
    singleTag = true;
  },
  'meta': () => {
    singleTag = true;
  },
  'param': () => {
    singleTag = true;
  },
  'source': () => {
    singleTag = true;
  },
  'track': () => {
    singleTag = true;
  },
  'wbr': () => {
    singleTag = true;
  },
};
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
function parseHTML(string) {
  const rawString = string;
  const rawStringTagOpener = returnMatchesArray(/</g, rawString);
  const rawStringTagCloser = returnMatchesArray(/>/g, rawString);
  const performanceReadings = {
    total: [0, 0],
    stringFormatting: [0, 0],
    tagsContainer: [0, 0],
  };
  performanceReadings.total[0] = performance.now();
  performanceReadings.stringFormatting[0] = performance.now();
  string = string.trim();
  string = string.replace(/\n */g, ' ');
  string = string.replace(/> *</g, '><');
  string = string.replace(/ *>/g, '>');
  string = string.replace(/< */g, '<');
  string = string.replace(/<!--/g, '<!-- ');
  performanceReadings.stringFormatting[1] = performance.now();
  const tagOpener = returnMatchesArray(/</g, string);
  const tagCloser = returnMatchesArray(/>/g, string);
  const finalElement = { elementType: 'root', attributes: {}, children: [] };
  [1, 2, 7, 8, 5];
  const currentPath = [finalElement];
  let currentPathDepth = 0;
  let openerIndex = 0,
    closerIndex = 0;
  if (string.indexOf('!') === 1) {
    openerIndex++;
    closerIndex++;
  }
  for (; openerIndex < tagOpener.length; openerIndex++, closerIndex++) {
    indexElement(tagOpener[openerIndex] + 1, tagCloser[closerIndex]);
    if (string.indexOf('>', tagCloser[closerIndex]) + 1 < tagOpener[openerIndex + 1]) {
      const text = string.slice(tagCloser[closerIndex] + 1, tagOpener[openerIndex + 1]);
      const currElementParent = currentPath[currentPathDepth];
      currElementParent.children.push({
        elementType: 'textContent',
        textContent: text,
      });
    }
  }
  function indexElement(tagBeginningGlobalIndex, tagEndingGlobalIndex) {
    const tagString = string.slice(tagBeginningGlobalIndex, tagEndingGlobalIndex);
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
    let singleTag2;
    let attributeString;
    tagEvents[elementType]?.();
    if (singleTag2) {
      currentPathDepth--;
      attributeString = tagString.slice(tagNameEnd, tagString.length - 1).trim();
    } else {
      attributeString = tagString.slice(tagNameEnd).trim();
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
              if (singleTag2) {
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
export default parseHTML;

