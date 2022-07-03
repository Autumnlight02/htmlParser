import { ElementObject, PerformanceReadings, StringObject } from './interfaces.js';

console.clear();

interface VoidTags {
  [key: string]: true;
}

const voidTags: VoidTags = {
  '!--': true,
  'img': true,
  'area': true,
  'base': true,
  'br': true,
  'col': true,
  'command': true,
  'embed': true,
  'hr': true,
  'input': true,
  'keygen': true,
  'link': true,
  'meta': true,
  'param': true,
  'source': true,
  'track': true,
  'wbr': true,
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
  // intializing performance readings
  const performanceReadings: PerformanceReadings = {
    total: [0, 0],
    stringFormatting: [0, 0],
    tagsContainer: [0, 0],
  };

  performanceReadings.total[0] = performance.now();
  performanceReadings.stringFormatting[0] = performance.now();

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

  console.log(string);

  performanceReadings.stringFormatting[1] = performance.now();

  const tagOpener = returnMatchesArray(/</g, string);
  const tagCloser = returnMatchesArray(/>/g, string);

  //function which checks if the given string is a voidTag
  function checkIfSingleTag(tag: string) {
    return voidTags[tag] !== undefined;
  }

  // depthRepresentation of the dom
  const currentPath: (ElementObject | StringObject)[] = [];

  // instead of using pop and push to have a depth representation of the latest node
  // i use currentPathDepth for direct acess and use this value to have a way faster implementation
  // working with push and pop would be 90% slower than acessing it like this currentPath[i] = data
  // https://jsbench.me/8rl533v168/1
  let currentPathDepth = -1;

  // to hold current index
  let openerIndex = 0,
    closerIndex = 0;

  // checking if the first node is docType
  if (string.indexOf('!') === 1) {
    //TODO add non skip, add it to an parent object or something
    openerIndex++;
    closerIndex++;
  }

  let safeGuard = 0;

  // looping though all tagopener
  for (; openerIndex < tagOpener.length; openerIndex++, closerIndex++) {
    // temporary security measurement
    if (safeGuard > 100) {
      break;
    }
    safeGuard++;

    indexElement(string.slice(tagOpener[openerIndex] + 1, tagCloser[closerIndex]));
    //checks if the next tag is >, if not we know due to our text formatting that the tag has to have some text in between
    if (string.indexOf('<') !== tagCloser[closerIndex]) {
      const text = string.slice(tagCloser[closerIndex], tagOpener[openerIndex]);
      const currElementParent = currentPath[currentPathDepth] as ElementObject;
      // currElement.children.push({
      //   elementType: 'textContent',
      //   textContent: text,
      // });
    }
  }

  function indexElement(tagString: string) {
    //fastes matching algorythm https://jsbench.me/j7l530t5hr/1
    // detecting if we have an endtag, if so we just move one up the current path
    if (tagString.indexOf('/') === 0) {
      //todo should i do currentPath[currentPathDepth] = undefined?
      currentPathDepth--;
      return;
    }

    console.log(tagString);

    const elementObject: ElementObject = {
      elementType: getElementType(tagString),
      attributes: {},
      children: [],
    };

    currentPathDepth++;
    currentPath[currentPathDepth] = elementObject;

    console.log(elementObject);
  }
  function getElementType(tagString: string) {
    return tagString.slice(0, getFirstEndingChar());
    // returns, if either " " / or nothing comes first
    function getFirstEndingChar() {
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
  // console.log(currentPath);
}
