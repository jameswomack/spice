// # Module spice
//
// No-frills string interpolation
//
// :licence: MIT
//   Copyright (c) 2013 Quildreen "Sorella" Motta
//   Copyright (c) 2014 James J. Womack
//
//   Permission is hereby granted, free of charge, to any person
//   obtaining a copy of this software and associated documentation
//   files (the "Software"), to deal in the Software without
//   restriction, including without limitation the rights to use, copy,
//   modify, merge, publish, distribute, sublicense, and/or sell copies
//   of the Software, and to permit persons to whom the Software is
//   furnished to do so, subject to the following conditions:
//
//   The above copyright notice and this permission notice shall be
//   included in all copies or substantial portions of the Software.
//
//   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
//   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//   MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
//   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
//   BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
//   ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
//   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//   SOFTWARE.

var inflect = require('i')(true);

// -- Constants & Aliases ----------------------------------------------
var templateRE = /{(\\?:)([^}]+)}/g;


// -- Helpers ----------------------------------------------------------

// ### Function isCallable
//
// Is a subject callable?
//
// :: A -> bool
function isCallable(subject) {
  return typeof subject === 'function';
}


// ### Function asValue
//
// Returns the actual substitution for the given value/key.
//
// :: template-value, string -> string
function asValue(value, key) {
  return isCallable(value) ?  value(key) : value;
}



// ### Interface template-value
//
// :: string | (string -> string)


// -- Core implementation ----------------------------------------------

// ### Function format
//
// Performs string interpolation given a template string as basis, and a
// substitution map.
//
// If a mapping is not given, we assume it to be empty, in which case
// the template variables are simply stripped away.
//
// A template variable is a special construct in the form:
//
//     <template-variable> ::= "{:" <any but "}"> "}"
//
// For example, to provide a "Hello, world!" template, that adjusts to a
// given name, one could write:
//
//     format("Hello, {:subject}!", { subject: "world" })
//     // => "Hello, world!"
//
// A template variable can be escaped by placing a backslash between the
// open-curly braces and the colon, such that the construct would be
// output verbatim:
//
//     format("Hello, {\\:subject}!", { subject: "world" })
//     // => "Hello, {:subject}!"
//
//     // Remember that backslashes must be escaped inside String
//     // literals.
//
// :: string, { string -> template-value } -> string
function format(string, mappings) {
  mappings = mappings || {};

  return string.replace(templateRE, function (match, mod, key) {
    var inflectMethodNames = [];
    var keyComponents = key.split('|');
    var returnString = '';

    if (keyComponents.length > 1) {
      key = keyComponents[0];
      inflectMethodNames = keyComponents.slice(1);
    }

    var templateDelimiterIsEscaped = (mod == '\\:');

    if (templateDelimiterIsEscaped) {
      returnString = '{:' + key + '}';
    } else {
      if (key in mappings) {
        returnString = asValue(mappings[key], key);
        for (var index in inflectMethodNames) {
          var inflectMethodName = inflectMethodNames[index];
          var inflectMethod = inflect[inflectMethodName];
          if (inflectMethod) {
            returnString = returnString[inflectMethodName];
          }
        }
      }
    }

    return returnString;
  });
}

module.exports = format;
