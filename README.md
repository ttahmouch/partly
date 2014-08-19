Partly
======

This module is meant to be a simple, extensible, "multipart" payload encoder and decoder.
It complies with the official grammar specification located here:

+ http://tools.ietf.org/html/rfc822
+ http://tools.ietf.org/html/rfc2045
+ http://tools.ietf.org/html/rfc2046
+ http://tools.ietf.org/html/rfc2047
+ http://tools.ietf.org/html/rfc2048
+ http://tools.ietf.org/html/rfc2049

The RFC documents are also bundled with this project.

Assumptions made for simplicity:

+ RFC 822 header fields have unstructured <field-name>s and <field-body>s.
+ RFC 822 header fields may be in any order.
+ RFC 2045 defined header fields are RFC 822 grammar compliant.
+ RFC 2045 defined header fields all begin with "Content-".
+ RFC 2046 composite media type, "multipart", must include a global boundary parameter.
+ RFC 2046 composite media type, "multipart", encoders must not generate transport padding (WSP).
+ RFC 2046 composite media type, "multipart", decoders must gracefully handle transport padding (WSP).
+ RFC 2046 composite media type, "multipart", decoders must ignore or discard any preamble or epilogue.
+ RFC 2046 composite media type, "multipart", body parts must use RFC 822 message syntax.
+ RFC 2046 composite media type, "multipart", body parts must allow for optional header fields.
+ RFC 2046 composite media type, "multipart", body parts must make no semantic assumption regarding header fields.
+ RFC 2046 composite media type, "multipart", body parts must not contain the boundary delimiter.

Lexical Tokens:

    CHAR  = <any ASCII character>                                           ; ( 0-127, %x00-7F )
    ALPHA = <any ASCII alphabetic character>                                ; ( 65-90 / 97-122, %x41-5A / %x61-7A )
    DIGIT = <any ASCII decimal digit>                                       ; ( 48-57, %x30-39 )
    CTL   = <any ASCII control character and DEL>                           ; ( 0-31 / 127, %x00-1F / %x7F )
    CR    = <ASCII CR, carriage return>                                     ; ( 13, %x0D )
    LF    = <ASCII LF, linefeed>                                            ; ( 10, %x0A )
    SPACE = <ASCII SP, space>                                               ; ( 32, %x20 )
    HTAB  = <ASCII HT, horizontal-tab>                                      ; ( 09, %x09 )
    CRLF  = CR LF                                                           ; ( 13 10, %x0D %x0A )
    WSP   = SPACE / HTAB                                                    ; ( 32 / 09, %x20 %x09 )
    OCTET = <any 0-255 octet value>                                         ; ( 0-255, %x00-FF )
    text  = <any CHAR, including bare CR & bare LF, but NOT including CRLF>

RFC 822 Header Fields BNF:

    field-name = 1*<any CHAR, excluding CTLs, SPACE, and ":">
    field-body = *text [CRLF WSP field-body]
    field      = field-name ":" [field-body] CRLF

RFC 2046 "Multipart" Boundary BNF:

    bcharsnospace = DIGIT / ALPHA / "'" / "(" / ")" / "+" / "_" / "," / "-" / "." / "/" / ":" / "=" / "?"
    bchars        = bcharsnospace / " "
    boundary      = 0*69<bchars> bcharsnospace

RFC 2046 "Multipart" Body BNF:

    body-part      = *field [CRLF *OCTET]
    multipart-body = [*(*text CRLF) *text CRLF]                ; Optional Preamble
                     "--" boundary *WSP CRLF                   ; --F6Rxhi'v4e)(fn
                     body-part                                 ; Content-Type: application/json
                                                               ;
                                                               ; {"cool":"stuff"}
                     *(CRLF "--" boundary *WSP CRLF body-part) ; --F6Rxhi'v4e)(fn
                                                               ; Content-Type: application/json
                                                               ;
                                                               ; {"cool":"other stuff"}
                     CRLF "--" boundary "--" *WSP              ; --F6Rxhi'v4e)(fn--
                     [CRLF *(*text CRLF) *text]                ; Optional Epilogue

A Complex Multipart Example:

This message contains five parts that are to be displayed serially:

+ 2 introductory plain text objects
+ 1 embedded multipart message
+ 1 text/enriched object
+ 1 closing encapsulated text message in a non-ASCII character set

The embedded multipart message itself contains two objects to be displayed in parallel:

+ 1 picture
+ 1 audio fragment


    MIME-Version: 1.0
    From: Nathaniel Borenstein <nsb@nsb.fv.com>
    To: Ned Freed <ned@innosoft.com>
    Date: Fri, 07 Oct 1994 16:15:05 -0700 (PDT)
    Subject: A multipart example
    Content-Type: multipart/mixed;
                  boundary=unique-boundary-1

    This is the preamble area of a multipart message.
    Mail readers that understand multipart format
    should ignore this preamble.

    If you are reading this text, you might want to
    consider changing to a mail reader that understands
    how to properly display multipart messages.

    --unique-boundary-1

    ... Some text appears here ...

    [Note that the blank between the boundary and the start
    of the text in this part means no header fields were
    given and this is text in the US-ASCII character set.
    It could have been done with explicit typing as in the
    next part.]

    --unique-boundary-1
    Content-type: text/plain; charset=US-ASCII

    This could have been part of the previous part, but
    illustrates explicit versus implicit typing of body
    parts.

    --unique-boundary-1
    Content-Type: multipart/parallel; boundary=unique-boundary-2

    --unique-boundary-2
    Content-Type: audio/basic
    Content-Transfer-Encoding: base64

    ... base64-encoded 8000 Hz single-channel
       mu-law-format audio data goes here ...

    --unique-boundary-2
    Content-Type: image/jpeg
    Content-Transfer-Encoding: base64

    ... base64-encoded image data goes here ...

    --unique-boundary-2--

    --unique-boundary-1
    Content-type: text/enriched

    This is <bold><italic>enriched.</italic></bold>
    <smaller>as defined in RFC 1896</smaller>

    Isn't it
    <bigger><bigger>cool?</bigger></bigger>

    --unique-boundary-1
    Content-Type: message/rfc822

    From: (mailbox in US-ASCII)
    To: (address in US-ASCII)
    Subject: (subject in US-ASCII)
    Content-Type: Text/plain; charset=ISO-8859-1
    Content-Transfer-Encoding: Quoted-printable

    ... Additional text in ISO-8859-1 goes here ...

    --unique-boundary-1--

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
