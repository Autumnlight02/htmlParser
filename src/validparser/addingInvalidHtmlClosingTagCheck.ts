import { ElementObject, PerformanceReadings, StringObject } from '../interfaces.js';

// console.clear();

// 1. Handling for Style Scripts comments

//@ts-ignore

let testCount = 100;
let arr = [];
for (let i = 0; i < testCount; i++) {
  let a = performance.now();
  parseHTML(sample);
  let b = performance.now();
  arr.push(b - a);
}
let total = 0;
for (let i = 0; i < arr.length; i++) {
  total = total + arr[i];
}
total = total / arr.length;
// console.log(arr);
console.log('total speed is: ' + total + 'ms');

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
function returnSingleTag() {
  return true;
}

export default function parseHTML(rawString: string) {
  interface TagEvent {
    [key: string]: () => any;
  }

  let initedScripts = false;

  let rawStringTagOpener: number[], rawStringTagCloser: number[];

  function initScripts() {
    rawStringTagOpener = returnMatchesArray(/</g, rawString) as number[];
    rawStringTagCloser = returnMatchesArray(/>/g, rawString) as number[];
  }

  const tagEvents: TagEvent = {
    //TODO convert this to a callable function
    'script': () => {
      if (initedScripts === false) {
        // activate the expensive indexing of the tagopener and closener if scripts is found
        initScripts();
        initedScripts = true;
      }
      // the +5 to account for <!--
      let scriptOpener = rawStringTagCloser[closerIndex] + 1;
      let scriptCloser = rawString.indexOf('</script>', rawStringTagOpener[openerIndex]);
      createContainerizedTextElement(rawString.slice(scriptOpener, scriptCloser));
      // console.log();
      // console.log(rawString.slice(scriptOpener, scriptCloser));
      //todo trim
      // console.log(scriptOpener, scriptCloser);
      skip = true;
      // return true; //behave like single tag
    },
    'style': () => {},
    '!--': () => {
      attributeString = '';
      // the +5 to account for <!--
      let commentOpener = tagOpener[openerIndex] + 5;
      let commentEnd = string.indexOf('-->', tagOpener[openerIndex]);
      createContainerizedTextElement(string.slice(commentOpener, commentEnd));

      // console.log(commentOpener, commentEnd);
      return true; // behaves like single tag
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
  // exposed attribute string so it can be removed to skip attribte selection (comments)
  let attributeString;

  // small overhead if script is found
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
  let string = rawString.trim();
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

  //function which checks if the given string is a voidTag
  function checkIfTagEvent(tag: string) {
    return tagEvents[tag]?.();
  }

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
    closerIndex = 0,
    skip = false;

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
    if (skip === false && string.indexOf('>', tagCloser[closerIndex]) + 1 < tagOpener[openerIndex + 1]) {
      const text = string.slice(tagCloser[closerIndex] + 1, tagOpener[openerIndex + 1]);
      // console.log(text);
      createTextElement(text);
    }
    skip = false;
  }

  // this one only removes >
  function createTextElement(text: string) {
    const currElementParent = currentPath[currentPathDepth] as ElementObject;
    currElementParent.children.push({
      elementType: 'textContent',
      textContent: text,
    });
    // function check for invalid characters
    if (text.includes('>')) {
      if (text.length < 120) {
        //fastes algorythm for short strings
        let pos = text.indexOf('>');
        while (pos > -1) {
          pos = text.indexOf('>', pos + 1);
          closerIndex++;
        }
      } else {
        //fastes algorythm for long strings
        //todo test
        closerIndex = closerIndex + text.split('>').length - 1;
      }
    }
  }

  // this one expludes both < and >
  function createContainerizedTextElement(text: string) {
    // console.log(text);
    const currElementParent = currentPath[currentPathDepth] as ElementObject;
    currElementParent.children.push({
      elementType: 'textContent',
      textContent: text,
    });
    // function check for invalid characters
    // also moved the if statement check since thats happening twice
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

  function indexElement(tagBeginningGlobalIndex: number, tagEndingGlobalIndex: number) {
    const tagString = string.slice(tagBeginningGlobalIndex, tagEndingGlobalIndex);
    // console.log(currentPathDepth);
    // console.log(tagString);
    // console.log(tagOpener[openerIndex]);

    let singleTag = false;

    // specialFunction.style();

    //fastes matching algorythm https://jsbench.me/j7l530t5hr/1
    // detecting if we have an endtag, if so we just move one up the current path
    const tagNameEnd = getFirstTagNameEndingChar();

    if (tagString.indexOf('/') === 0) {
      //todo should i do currentPath[currentPathDepth] = undefined?
      const matchingOpener = currentPath[currentPathDepth] as ElementObject;
      if (matchingOpener.elementType !== tagString.slice(1, tagString.length).toLocaleLowerCase()) {
        console.log('ERROR');
        // console.log(matchingOpener.elementType, tagString.slice(1, tagNameEnd).toLocaleLowerCase());
        currentPathDepth++;
      }
      currentPathDepth--;
      return;
    }

    // variables initialized out of object to decrease the lookup overhead of an object
    const elementType = tagString.slice(0, tagNameEnd).toLocaleLowerCase();
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

    attributeString = tagString.slice(tagNameEnd).trim();
    if (checkIfTagEvent(elementObject.elementType) === true) {
      currentPathDepth--;
      singleTag = true;
      // removing the / at single tags and trimming away the space
      //TODO FIX BUG
      attributeString = attributeString.slice(0, attributeString.length - 1);
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
  console.log(finalElement);
  // console.log('finaltime: ' + (performanceReadings.total[1] - performanceReadings.total[0]) + 'ms');
}

//@ts-ignore
import sample from '../../sample/old1.js';

// changes : exposing the remaning tag string
//todo check trim performance
