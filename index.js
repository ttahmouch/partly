/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 *
 * Browser:
 * <script src="partly.js"></script>
 * <script>
 *     var multipart = partly.Multipart.create();
 * </script>
 *
 * Node.JS:
 * var partly = require('partly'),
 *     multipart = partly.Multipart.create();
 *
 * @see http://stackoverflow.com/questions/7327164/common-module-in-node-js-and-browser-javascript
 *
 * Polyfills:
 * Currently, none.
 */

(function (exports) {
    /**
     * Lexical Tokens:
     * CHAR  = <any ASCII character>                                           ; ( 0-127, %x00-7F )
     * ALPHA = <any ASCII alphabetic character>                                ; ( 65-90 / 97-122, %x41-5A / %x61-7A )
     * DIGIT = <any ASCII decimal digit>                                       ; ( 48-57, %x30-39 )
     * CTL   = <any ASCII control character and DEL>                           ; ( 0-31 / 127, %x00-1F / %x7F )
     * CR    = <ASCII CR, carriage return>                                     ; ( 13, %x0D )
     * LF    = <ASCII LF, linefeed>                                            ; ( 10, %x0A )
     * SPACE = <ASCII SP, space>                                               ; ( 32, %x20 )
     * HTAB  = <ASCII HT, horizontal-tab>                                      ; ( 09, %x09 )
     * CRLF  = CR LF                                                           ; ( 13 10, %x0D %x0A )
     * WSP   = SPACE / HTAB                                                    ; ( 32 / 09, %x20 %x09 )
     * OCTET = <any 0-255 octet value>                                         ; ( 0-255, %x00-FF )
     * text  = <any CHAR, including bare CR & bare LF, but NOT including CRLF>
     */

    /**
     * Multipart -- data consisting of multiple entities of independent data types. Four subtypes are initially
     * defined, including the basic "mixed" subtype specifying a generic mixed set of parts, "alternative" for
     * representing the same data in multiple formats, "parallel" for parts intended to be viewed simultaneously,
     * and "digest" for multipart entities in which each part has a default type of "message/rfc822".
     *
     * @param parts {Array} of body parts. It is optional. Body parts may be added later using {Multipart}.part({}).
     * @example
     * [
     *  {
     *     'Body': '... Some text appears here ...'
     *  },
     *  {
     *     'Content-Type': 'multipart/parallel',
     *     'Body': [
     *              {
     *                 'Content-Type': 'audio/basic',
     *                 'Content-Transfer-Encoding': 'base64',
     *                 'Body': '... base64-encoded audio data goes here ...'
     *              },
     *              {
     *                 'Content-Type': 'image/jpeg',
     *                 'Content-Transfer-Encoding': 'base64',
     *                 'Body': '... base64-encoded image data goes here ...'
     *              }
     *             ]
     *  }
     * ]
     *
     * - Any Multipart Body should be represented by an {Array} of {Object}s.
     * - Any Body Part should be represented as an {Object} with arbitrary fields representing "Content-" headers.
     * - Any Body Part should have a "Body" field representing an encoded body {string},
     *   or a nested Multipart Body {Array}. The nesting can be infinite.
     * - Any Body Part that is also a Multipart Body, as depicted above, need NOT provide a boundary. It will be
     *   provided when encoding. Although, a Content-Type field MUST be provided.
     *
     *   In other words, just supply this:
     *   Content-Type: multipart/mixed
     *
     *   NOT this:
     *   Content-Type: multipart/mixed; boundary="gc0pJq0M:08jU534c0p"
     *
     * @return {Multipart}
     * @constructor
     */
    function Multipart(parts) {
        this.boundary = Multipart.boundary();
        this.parts = Array.isArray(parts) ? parts : [];
        return this;
    }

    /**
     * Create a new instance of Multipart.
     *
     * @param parts {Array} of body parts. It is optional. Body parts may be added later using Multipart.part({}).
     * @see Multipart
     *
     * @return {Multipart}
     */
    Multipart.create = function (parts) {
        return new Multipart(parts);
    };

    /**
     * The only mandatory global parameter for the "multipart" media type is the boundary parameter, which consists of
     * 1 to 70 characters from a set of characters known to be very robust through mail gateways, and NOT ending with
     * white space. (If a boundary delimiter line appears to end with white space, the white space must be presumed to
     * have been added by a gateway, and must be deleted.)
     *
     * Because boundary delimiters must not appear in the body parts being encapsulated, a user agent must exercise
     * care to choose a unique boundary parameter value. A boundary parameter value could be the result of an
     * algorithm designed to produce boundary delimiters with a very low probability of already existing in the data
     * to be encapsulated without having to prescan the data.
     *
     * Every resulting boundary delimiter from this algorithm will be exactly 70 characters and will NOT end in a space.
     *
     * @return {string} representing the boundary delimiter.
     */
    Multipart.boundary = function () {
        /**
         * RFC 2046 "Multipart" Boundary BNF:
         * bcharsnospace = DIGIT / ALPHA / "'" / "(" / ")" / "+" / "_" / "," / "-" / "." / "/" / ":" / "=" / "?"
         * bchars        = bcharsnospace / " "
         * boundary      = 0*69<bchars> bcharsnospace
         */
        for (var bChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'()+_,-./:=? ",
                 boundary = '',
                 i = 0; i < 69; i += 1) {
            boundary += bChars.charAt(Math.floor(Math.random() * bChars.length));
        }
        return boundary + bChars.charAt(Math.floor(Math.random() * (bChars.length - 1)));
    };

    /**
     * A body part consists of a header area, a blank line, and a body area.
     *
     * NO header fields are actually required in body parts. A body part that starts with a blank line, therefore, is
     * allowed and is a body part for which all default values are to be assumed. In such a case, the absence of a
     * Content-Type header usually indicates that the corresponding body has a
     * Content-Type of "text/plain; charset=US-ASCII".
     *
     * The only header fields that have defined meaning for body parts are those the names of which begin with
     * "Content-".  All other header fields may be ignored in body parts.
     *
     * @param part {Object}
     * @see Multipart
     * @example
     * {
     *     'Content-Type': 'multipart/parallel',
     *     'Body': [
     *              {
     *                 'Content-Type': 'audio/basic',
     *                 'Content-Transfer-Encoding': 'base64',
     *                 'Body': '... base64-encoded audio data goes here ...'
     *              },
     *              {
     *                 'Content-Type': 'image/jpeg',
     *                 'Content-Transfer-Encoding': 'base64',
     *                 'Body': '... base64-encoded image data goes here ...'
     *              }
     *             ]
     * }
     *
     * @return {string} representing the body part.
     */
    Multipart.part = function (part) {
        /**
         * RFC 822 Header Fields BNF / RFC 2046 "Multipart" Body BNF:
         * field-name = 1*<any CHAR, excluding CTLs, SPACE, and ":">
         * field-body = *text [CRLF WSP field-body]
         * field      = field-name ":" [field-body] CRLF
         * body-part  = *field [CRLF *OCTET]
         */
        var body = '';
        if (!!part && typeof part === 'object') {
            var content = part['Body'],
                multipart = Array.isArray(content),
                boundary = multipart ? Multipart.boundary() : '',
                parameter = multipart ? '; boundary="' + boundary + '"' : '';

            for (var field in part) {
                if (part.hasOwnProperty(field) && field !== 'Body') {
                    body += field + ':' + part[field] + (field === 'Content-Type' ? parameter : '') + '\r\n';
                }
            }

            if (!!content) {
                body += '\r\n' + (multipart ? Multipart.body(content, boundary) : content);
            }
        }
        return body;
    };

    /**
     * A body must contain one or more body parts, each preceded by a boundary delimiter line, and the last one
     * followed by a closing boundary delimiter line.
     *
     * @param parts {Array} of body parts.
     * @see Multipart
     *
     * @param boundary {string} representing a boundary delimiter.
     * @see Multipart.boundary
     *
     * @return {string} representing the multipart body.
     */
    Multipart.body = function (parts, boundary) {
        /**
         * RFC 2046 "Multipart" Body BNF:
         * multipart-body = [*(*text CRLF) *text CRLF]                ; Optional Preamble
         *                  "--" boundary *WSP CRLF                   ; --F6Rxhi'v4e)(fn
         *                  body-part                                 ; Content-Type: application/json
         *                                                            ;
         *                                                            ; {"cool":"stuff"}
         *                  *(CRLF "--" boundary *WSP CRLF body-part) ; --F6Rxhi'v4e)(fn
         *                                                            ; Content-Type: application/json
         *                                                            ;
         *                                                            ; {"cool":"other stuff"}
         *                  CRLF "--" boundary "--" *WSP              ; --F6Rxhi'v4e)(fn--
         *                  [CRLF *(*text CRLF) *text]                ; Optional Epilogue
         */
        var body = '';
        if (Array.isArray(parts)) {
            for (var part in parts) {
                if (parts.hasOwnProperty(part)) {
                    body += Multipart.part(parts[part]);
                    if (parts.length > 1 && part < parts.length - 1) {
                        body += '\r\n' + '--' + boundary + '\r\n';
                    }
                }
            }
        }
        return '--' + boundary + '\r\n' + body + '\r\n' + '--' + boundary + '--';
    };

    /**
     * Decodes a {string} representing a multipart body to an {Array} of body parts.
     *
     * @param body {string} representing a multipart body.
     * @see Multipart.body
     *
     * @param boundary {string} representing a boundary delimiter.
     * @see Multipart.boundary
     *
     * @return {Array} of body parts.
     */
    Multipart.decode = function (body, boundary) {
        var parts = [],
            bChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'()+_,-./:=? ",
            bodyPartFollows = false;
        if (typeof body === 'string' && typeof boundary === 'string') {
            tokenize:
                for (var i = 0, c = ''; c = body.charAt(i); i += 1) {
                    if (c === '-' && body.charAt(i + 1) === '-') {
                        boundaryArea:
                            for (var j = 0; body.charAt(i + 2 + j) === boundary.charAt(j); j += 1) {
                                if (j === boundary.length - 1) {
                                    /**
                                     * 1. Skip Boundary.
                                     * 2. Is Closing Boundary? Done Tokenizing.
                                     * 3. Ignore Whitespace Characters.
                                     * 4. Ignore CRLF.
                                     */
                                    i += 1 + boundary.length;
                                    if (body.charAt(i + 1) === '-' && body.charAt(i + 2) === '-') {
                                        break tokenize;
                                    }
                                    while (body.charAt(i + 1) === ' ' || body.charAt(i + 1) === '\t') {
                                        i += 1;
                                    }
                                    if (body.charAt(i + 1) === '\r' && body.charAt(i + 2) === '\n') {
                                        i += 2;
                                    }
                                    bodyPartFollows = true;
                                    break boundaryArea;
                                }
                            }
                    } else if (bodyPartFollows) {
                        var fieldName = '',
                            fieldBody = '',
                            partBody = '',
                            partBoundary = '',
                            part = {};
                        fieldNameArea:
                            while ((c > ' ' && c < ':') || (c > ':' && c <= '~')) {
                                fieldName += c;
                                c = body.charAt(i += 1);
                                if (c === ':') {
                                    c = body.charAt(i += 1);
                                    fieldBodyArea:
                                        while (c.charCodeAt(0) < 128) {
                                            /**
                                             * Is Header Parameter?
                                             */
                                            if (c === ';') {
                                                var start = i,
                                                    isBchar = false;
                                                /**
                                                 * 1. Ignore Whitespace Characters and ";".
                                                 * 2. Is Boundary Parameter? Ignore '"' and Cut Boundary Parameter.
                                                 * 3. Otherwise, Jump Back to Start.
                                                 */
                                                do {
                                                    c = body.charAt(i += 1);
                                                } while (c === ' ' || c === '\t');
                                                if (body.substr(i, 9) === 'boundary=') {
                                                    partBoundaryArea:
                                                        for (c = body.charAt(i += 9);
                                                             (isBchar = bChars.lastIndexOf(c) !== -1) || c === '"';
                                                             c = body.charAt(i += 1)) {
                                                            if (isBchar) {
                                                                partBoundary += c;
                                                            }
                                                        }
                                                }
                                                if (!partBoundary) {
                                                    c = body.charAt(i = start);
                                                }
                                            }
                                            /**
                                             * 1. Is Header Field Body Ending or Unfolding?
                                             * 2. Both Cases, Ignore CRLF.
                                             * 3. Case: Ending, Retain Header Field in Body Part {Object}.
                                             * 4. Case: Unfolding, Retain Whitespace Character in Field Body.
                                             */
                                            if (c === '\r' && body.charAt(i + 1) === '\n') {
                                                c = body.charAt(i += 2);
                                                /**
                                                 * Header Field Body is Ending.
                                                 */
                                                if (c !== ' ' && c !== '\t') {
                                                    part[fieldName] = fieldBody;
                                                    fieldName = fieldBody = '';
                                                    break fieldBodyArea;
                                                }
                                            }
                                            fieldBody += c;
                                            c = body.charAt(i += 1);
                                        }
                                }
                            }
                        if (c === '\r' && body.charAt(i + 1) === '\n') {
                            partBodyArea:
                                for (i += 2; c = body.charAt(i); partBody += c, i += 1) {
                                    if (c === '\r' && body.charAt(i + 1) === '\n') {
                                        if (body.charAt(i + 2) === '-' && body.charAt(i + 3) === '-') {
                                            for (var j = 0; body.charAt(i + 4 + j) === boundary.charAt(j); j += 1) {
                                                if (j === boundary.length - 1) {
                                                    break partBodyArea;
                                                }
                                            }
                                        }
                                    }
                                }
                            part['Body'] = !!partBoundary ? Multipart.decode(partBody, partBoundary) : partBody;
                        }
                        parts.push(part);
                        bodyPartFollows = false;
                    }
                }
        }
        return parts;
    };

    /**
     * Decodes a {string} representing a multipart body to an instance of Multipart.
     *
     * @param body {string} representing a multipart body.
     * @see Multipart.body
     *
     * @param boundary {string} representing a boundary delimiter.
     * @see Multipart.boundary
     *
     * @return {Multipart}
     */
    Multipart.from = function (body, boundary) {
        return Multipart.create(Multipart.decode(body, boundary));
    }

    /**
     * Encodes the current instance of Multipart to {string}.
     *
     * @return {string} representing the multipart body.
     */
    Multipart.prototype.encode = function () {
        return Multipart.body(this.parts, this.boundary);
    };

    /**
     * Adds a body part {Object} to the current instance of {Multipart}. This is an alternative to passing them to
     * the @constructor in an enclosing {Array}.
     *
     * @param part {Object}
     * @see Multipart
     * @example
     * {
     *     'Content-Type': 'multipart/parallel',
     *     'Body': [
     *              {
     *                 'Content-Type': 'audio/basic',
     *                 'Content-Transfer-Encoding': 'base64',
     *                 'Body': '... base64-encoded audio data goes here ...'
     *              },
     *              {
     *                 'Content-Type': 'image/jpeg',
     *                 'Content-Transfer-Encoding': 'base64',
     *                 'Body': '... base64-encoded image data goes here ...'
     *              }
     *             ]
     * }
     *
     * @return {Multipart} for chaining.
     */
    Multipart.prototype.part = function (part) {
        if (!!part && typeof part === 'object') {
            this.parts.push(part);
        }
        return this;
    };

    exports.Multipart = Multipart;
})(typeof exports === 'undefined' ? this['partly'] = {} : exports);
