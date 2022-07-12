import { ElementObject, PerformanceReadings, StringObject } from './interfaces.js';

// console.clear();

// 1. Handling for Style Scripts comments

interface TagEvents {
  [key: string]: () => void;
}

//todo instead of this expose some variables to entire function scope which affect the tag, and then change them with an arrow function
// const specialBehaviour = {
//   'div': () => {
//     //@ts-ignore
//     console.log(elementType);
//   },
//   'script': () => {},
//   'style': () => {},
//   '!--': () => {},
// };

// import sample from '../sample/1.js';
// console.log('start');
// console.log(parseHTML(sample));

//* Exposed variables from indexElement for faster runtime and moddable features*/

let singleTag = false;

const tagEvents: TagEvents = {
  //TODO convert this to a callable function
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

function returnMatchesArray(regex: RegExp, string: string) {
  // faster selfcoded string.matchAll(regex) with deconstruction implementation, [...string.matchAll] runs 30% slower : https://jsbench.me/f6kxkn9ruv/1
  const matchingLetters = string.matchAll(regex);
  let nextValue = matchingLetters.next();
  const result: number[] = [];
  while (nextValue.value !== undefined) {
    result.push(nextValue.value.index);
    nextValue = matchingLetters.next();
  }
  return result;
}

export default function parseHTML(string: string) {
  const rawString = string;

  // small overhead if script is found
  const rawStringTagOpener = returnMatchesArray(/</g, rawString);
  const rawStringTagCloser = returnMatchesArray(/>/g, rawString);
  // intializing performance readings
  const performanceReadings: PerformanceReadings = {
    total: [0, 0],
    stringFormatting: [0, 0],
    tagsContainer: [0, 0],
  };

  performanceReadings.total[0] = performance.now();
  performanceReadings.stringFormatting[0] = performance.now();

  //TODO test performance
  // formatting string
  // removing beginning and end spacings
  string = string.trim();
  // collapsing multiple spaces to one
  string = string.replace(/\n */g, ' ');
  // removing spaces between tags if empty
  string = string.replace(/> *</g, '><');
  // removing spaces at the end and the beginning of a tag
  string = string.replace(/ *>/g, '>');
  string = string.replace(/< */g, '<');
  string = string.replace(/<!--/g, '<!-- ');

  performanceReadings.stringFormatting[1] = performance.now();

  const tagOpener = returnMatchesArray(/</g, string);
  const tagCloser = returnMatchesArray(/>/g, string);

  //todo rework
  const finalElement: ElementObject = { elementType: 'root', attributes: {}, children: [] };

  [1, 2, 7, 8, 5];
  // depthRepresentation of the dom
  const currentPath: (ElementObject | StringObject)[] = [finalElement];

  // instead of using pop and push to have a depth representation of the latest node
  // i use currentPathDepth for direct acess and use this value to have a way faster implementation
  // working with push and pop would be 10-90% slower than acessing it like this currentPath[i] = data
  // https://jsbench.me/8rl533v168/1
  let currentPathDepth = 0;

  // to hold current index
  let openerIndex = 0,
    closerIndex = 0;

  // checking if the first node is docType
  if (string.indexOf('!') === 1) {
    //TODO add non skip, add it to an parent object or something
    openerIndex++;
    closerIndex++;
  }

  // looping though all tagopener
  for (; openerIndex < tagOpener.length; openerIndex++, closerIndex++) {
    indexElement(tagOpener[openerIndex] + 1, tagCloser[closerIndex]);
    //checks if the next letter is <, if not we know due to our text formatting that the tag has to have some text in between
    // in addition checking if tagOpener is bigger, usually id use !== so we know theyre not equal, but issue is that that also accounts for undefined once we hit the last index
    // so i use smaller then
    if (string.indexOf('>', tagCloser[closerIndex]) + 1 < tagOpener[openerIndex + 1]) {
      const text = string.slice(tagCloser[closerIndex] + 1, tagOpener[openerIndex + 1]);
      const currElementParent = currentPath[currentPathDepth] as ElementObject;
      currElementParent.children.push({
        elementType: 'textContent',
        textContent: text,
      });
    }
  }

  function indexElement(tagBeginningGlobalIndex: number, tagEndingGlobalIndex: number) {
    const tagString = string.slice(tagBeginningGlobalIndex, tagEndingGlobalIndex);

    // specialFunction.style();

    //fastes matching algorythm https://jsbench.me/j7l530t5hr/1
    // detecting if we have an endtag, if so we just move one up the current path
    if (tagString.indexOf('/') === 0) {
      //todo should i do currentPath[currentPathDepth] = undefined?
      currentPathDepth--;
      return;
    }

    const tagNameEnd = getFirstTagNameEndingChar();

    // variables initialized out of object to decrease the lookup overhead of an object
    const elementType = tagString.slice(0, tagNameEnd);
    const attributes: { [key: string]: string } = {};
    const elementObject: ElementObject = {
      elementType: elementType,
      attributes: attributes,
      children: [],
    };

    currentPathDepth++;
    currentPath[currentPathDepth] = elementObject;

    const parentObject = currentPath[currentPathDepth - 1] as ElementObject;
    parentObject.children.push(elementObject);

    let singleTag;
    let attributeString;

    tagEvents[elementType]?.();

    if (singleTag) {
      currentPathDepth--;
      // removing the / at single tags and trimming away the space
      //TODO FIX BUG
      attributeString = tagString.slice(tagNameEnd, tagString.length - 1).trim();
    } else {
      attributeString = tagString.slice(tagNameEnd).trim();
    }

    if (attributeString !== '') {
      // current index
      let currentIndex = 0;
      let safeGuard = 0;
      while (attributeString.slice(currentIndex, attributeString.length) !== '') {
        // console.log(attributeString);
        // getting next valid character
        safeGuard++;
        if (safeGuard === 10) {
          // console.log('SAFEGUARD');
          break;
        }

        let nextValidSeperatorIndex;
        let nextValidSeperator;

        const one = attributeString.indexOf(' ', currentIndex);
        const second = attributeString.indexOf('=', currentIndex);

        // function to get the next valid character
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
        // End of function (used it here like this since I dont want to return an array (due overhead) to get both informations)

        // presetting attribute content to "" to show that its empty
        let attributeContent = '';
        let attributeName = attributeString.slice(currentIndex, nextValidSeperatorIndex);
        // assigning the next index so in the case its a single attribute we dont have an else case
        currentIndex = nextValidSeperatorIndex;
        //todo move this up into the function?
        if (nextValidSeperator === '=') {
          // using slice since its faster then lookup with index
          const seperatorCharacter: "'" | '"' = attributeString.slice(
            nextValidSeperatorIndex + 1,
            nextValidSeperatorIndex + 2
          ) as "'" | '"';
          // adding +2 to account for space and chacater
          currentIndex = nextValidSeperatorIndex + 2;
          // checking if its an attribute withhin quotes
          if (seperatorCharacter === "'" || seperatorCharacter === '"') {
            let attributeContentEndIndex: number = attributeString.indexOf(seperatorCharacter, currentIndex);

            // doing +2 so we dont only account for the attribute ending character " or ', but so we also account for the space after it
            currentIndex = attributeContentEndIndex + 2;

            if (attributeContentEndIndex === -1) {
              currentIndex = attributeString.length;
              while (attributeContentEndIndex === -1) {
                // incrementing the closerindex so we can further increase the attributeEndIndex
                closerIndex++;
                //todo is globally trimming needed?
                attributeString = string.slice(tagBeginningGlobalIndex + tagNameEnd, tagCloser[closerIndex]).trim();
                attributeContentEndIndex = attributeString.indexOf(seperatorCharacter, currentIndex);
              }
              if (singleTag) {
                attributeString = attributeString.slice(0).trim();
              }
            }

            attributeContent = attributeString.slice(nextValidSeperatorIndex + 2, attributeContentEndIndex);
            // adding +2 to account for space and chacater
            currentIndex = attributeContentEndIndex + 2;
          }
        }
        attributes[attributeName] = attributeContent;
      }

      // handling all tagopener withhin attributes https://jsbench.me/nfl5fdo1co/2 // short text expected thats why small one optimized
      let pos = attributeString.indexOf('<');
      while (pos > -1) {
        pos = attributeString.indexOf('<', pos + 1);
        openerIndex++;
      }
    }

    // returns the first tagname ending character
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
  // console.log(finalElement);
  // console.log('finaltime: ' + (performanceReadings.total[1] - performanceReadings.total[0]) + 'ms');
}
