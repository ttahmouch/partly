Partly
======

This module is meant to be a simple, extensible, multipart payload encoder and decoder that complies with the official
grammar specification located here:

+ http://tools.ietf.org/html/rfc2045
+ http://tools.ietf.org/html/rfc2046
+ http://tools.ietf.org/html/rfc2047
+ http://tools.ietf.org/html/rfc2048
+ http://tools.ietf.org/html/rfc2049

## Installation

    npm install partly --save

## Usage

    /**
     * Module Dependencies.
     */
    var partly = require('partly'),
        mp = partly.multipart,
        bp = partly.bodypart;

    var body = mp('mixed');

        console.log(
            body
                .addBodyPart(
                    bp()
                        .setType('application/json')
                        .setPayload('{}')
                ).toString()
        );

## Tests

No unit tests are currently present. Eventually:

    npm test

## Contributing

In lieu of a formal style guideline, take care to maintain the existing coding style.

## Release History

+ 0.0.1 Initial release
