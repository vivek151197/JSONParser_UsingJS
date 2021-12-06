const NULL = "null", TRUE = "true", FALSE = "false";

const nullParser = input => {
  if (input.startsWith(NULL)) {
  	return [ null, input.slice(NULL.length) ];
  }
  return null;
}

const booleanParser = input => {
	if (input.startsWith(FALSE)) {
		return [ false, input.slice(FALSE.length) ];
	}
	if(input.startsWith(TRUE)) {
		return [ true, input.slice(TRUE.length) ];
	}
  return null;
}

const numberParser = input => {
	const number = input.match(/^-?((0\.[0-9]+)|([1-9][0-9]*(\.[0-9]+)?)|0[,}\]])([eE][-+]?[0-9]+)?/);
	if (number) {
		return [ Number(number[0]), input.slice(number[0].length) ];
	}
	return null;
}

const stringParser = input => {
	const stringregex = /^\s*\"((\\([\"\\\/bfnrt]|u[a-fA-F0-9]{4})|[^"\\\0-\x1F\x7F]+)*)\"\s*/
	let validstring = stringregex.exec(input)
	if (validstring === null) return null;
	return [ validstring[1], input.slice(validstring[0].length) ]
}

const spaceParser = input => {
  const withoutSpace = input.replace(/^\s+|\s+$/, "");
  return withoutSpace;
}
  
const arrayParser = input => {
  if (!input.startsWith("[")) return null;
	input = spaceParser(input.slice(1));
  let parsedArray = [];
  let value;
	while (!input.startsWith("]")) {
	  value = valueParser(input)
    if (!value) return null;
    parsedArray.push(value[0]);
    input = spaceParser(value[1]);
    if (input[0] === ',') {
      input = spaceParser(input.slice(1));
       if (input[0]==="]") {
        return null;
      }
      continue;
    }
	}
  return [ parsedArray, input.slice(1) ];
}

const objectParser = input => {
  if (!input.startsWith("{")) return null;
  input = spaceParser(input.slice(1));
  let parsedObject = {};
  let value;
  while (!input.startsWith("}")) {
    input = spaceParser(input);
    let keyString = stringParser(input);
    if (!keyString) return null;
    let key = keyString[0];
    // parsedObject[key];
    input = spaceParser(keyString[1]);
    if (input[0] === ":") {
      input = input.slice(1);
      value = valueParser(input);
    }
    if (!value) return null;
    parsedObject[key] = value[0];
    input = spaceParser(value[1]);
    if (input[0] === ","){
      input = spaceParser(input.slice(1));
      if (input[0] === "}") return null;
    }
  }
  return [ parsedObject, input.slice(1) ];
}

function valueParser(input) {
  input = spaceParser(input);
  return (
    nullParser(input) || 
    booleanParser(input) || 
    numberParser(input) || 
    stringParser(input) || 
    arrayParser(input) || 
    objectParser(input)
  )
}

function jsonParser(input) {
  input = spaceParser(input);
  if (
    (!input.startsWith("{") || !input.endsWith("}")) && 
    (!input.startsWith("[") || !input.endsWith("]"))
  ) {
    return null;
  }
  let parsedValue = valueParser(input);
  if(!parsedValue || parsedValue[1]) return null;
  return (parsedValue[0]);
}

const fs = require('fs')
fs.readdir('./testJSONfiles', (err, files) => {
  if (err) console.log(err)
  else {
    files.forEach(file => { 
      const data = fs.readFileSync(`./testJSONfiles/${file}`, 'utf-8')
      console.log(file, jsonParser(data) || 'Invalid JSON');
    
    })
  }
})

module.exports = jsonParser;