/**
 * Falsy Values: false, 0, "", null, undefined, NaN
 */

/**
 * Please see examples and grammar at:
 * http://tools.ietf.org/html/rfc2045
 * http://tools.ietf.org/html/rfc2046
 * http://tools.ietf.org/html/rfc2047
 * http://tools.ietf.org/html/rfc2048
 * http://tools.ietf.org/html/rfc2049
 */

Function.prototype.method = function (name, func) {
    this.prototype[name] = func;
    return this;
};

var bChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'()+_,-./:=? ",
    crlf = '\r\n',
    hyphens = '--',
    crlfRegex = /(\r\n)/g;

/**
 * Generates a count between 0 and 69. Math.random generates a random float [0, 1).
 * So the number can never be exactly 70.
 * @return {Number}
 */
function boundaryCount() {
    return Math.floor(Math.random() * 70);
}

/**
 * Generates a random MIME boundary-acceptable, US-ASCII character.
 * @return {String}
 */
function boundaryCharacter() {
    return bChars.charAt(Math.floor(Math.random() * bChars.length));
}

/**
 * Generates a full boundary based on the count generated and every random character generated.
 * @return {String}
 */
function boundary() {
    var count = boundaryCount(),
        tempString = '',
        notSpace = boundaryCharacter();

    for (var i = 0; i < count; i++) {
        tempString += boundaryCharacter();
    }

    while (notSpace === ' ') {
        notSpace = boundaryCharacter();
    }

    return tempString + notSpace;
}

/**
 * Prefixes a set of hyphens to be MIME compliant.
 * @param boundary is a generated boundary using boundary()
 * @return {String}
 */
function dashBoundary(boundary) {
    return hyphens + boundary.toString();
}

/**
 * Generates a mutlipart entity delimiter.
 * @param boundary is a generated boundary using boundary()
 * @return {String}
 */
function delimiter(boundary) {
    return crlf + dashBoundary(boundary);
}

/**
 * Generates an absolute, closing delimiter for the entire set of entities in a multipart body.
 * @param boundary is a generated boundary using boundary()
 * @return {String}
 */
function closeDelimiter(boundary) {
    return delimiter(boundary) + hyphens;
}

/**
 * Converts any crlf into a space.
 * @param text is the string anticipated to be used as a preamble or epilogue in a mutlipart body.
 * @return {String}
 */
function discardText(text) {
    return text.replace(crlfRegex, ' ');
}

/**
 * A constructor function that defines the semantics of a multipart body.
 * @param subtype should be a String indicating the subtype this instance of a Multipart media type will be.
 * @param preamble should be a String that will be concatenated before the body parts. It should ideally not contain
 * any CRLF sequences. They will be stripped anyways.
 * @param epilogue should be a String that will be concatenated after the body parts. It should ideally not contain
 * any CRLF sequences. They will be stripped anyways.
 * @return {*}
 * @constructor
 */
function Multipart(subtype, preamble, epilogue) {
    this._parts = [];
    this._boundary = boundary();
    this._subtype = ((typeof subtype === 'string') ? subtype : 'mixed');
    this._preamble = ((typeof preamble === 'string') ? discardText(preamble) + crlf : '');
    this._epilogue = ((typeof epilogue === 'string') ? crlf + discardText(epilogue) : '');
    return this;
}

/**
 * Accessor methods
 * addBodyPart allows you to add instances of BodyPart to the _parts field of a Multipart instance.
 * setSubtype allows you to provide the same String you could with the constructor.
 * setBoundary allows you to provide the same String you could with the constructor.
 * setPreamble allows you to provide the same String you could with the constructor.
 * setEpilogue allows you to provide the same String you could with the constructor.
 */
Multipart.method('addBodyPart', function (part) {
    if (part instanceof BodyPart && this._parts.lastIndexOf(part) === -1) {
        this._parts.push(part);
    }
    return this;
});

Multipart.method('setSubtype', function (subtype) {
    this._subtype = ((typeof subtype === 'string') ? subtype : this._subtype);
    return this;
});

Multipart.method('getBoundary', function () {
    return this._boundary;
});

Multipart.method('setBoundary', function (delimiter) {
    this._boundary = (typeof delimiter === 'string') ? delimiter : this._boundary;
    return this;
});

Multipart.method('setPreamble', function (preamble) {
    this._preamble = ((typeof preamble === 'string') ? discardText(preamble) + crlf : this._preamble);
    return this;
});

Multipart.method('setEpilogue', function (epilogue) {
    this._epilogue = ((typeof epilogue === 'string') ? crlf + discardText(epilogue) : this._epilogue);
    return this;
});

/**
 * Utility method to serialize the Multipart body to String.
 * @return String representing the multipart body and its contained body parts
 */
Multipart.method('toString', function () {
    var parts = this._parts,
        multipartBody = '',
        encapsulation = (delimiter(this._boundary) + crlf),
        hasMoreThanOnePart = (parts.length > 1);

    /**
     * Serialize the body parts in the parts array. Make sure there is an encapsulation boundary around the individual
     * body parts.
     */
    for (var part in parts) {
        multipartBody += parts[part].toString();
        multipartBody += (hasMoreThanOnePart && part < parts.length - 1) ? encapsulation : '';
    }

    /**
     * Concatenate the preamble if it exists, first boundary delimiter, serialized body parts, closing delimiter, and
     * an epilogue if it exists.
     */
    return this._preamble +
        (dashBoundary(this._boundary) + crlf) +
        multipartBody +
        closeDelimiter(this._boundary) +
        this._epilogue;
});

/**
 * Convenience method for instantiating a Multipart without having to use the new operator.
 * @param subtype
 * @param preamble
 * @param epilogue
 * @return {Multipart}
 */
function multipart(subtype, preamble, epilogue) {
    return new Multipart(subtype, preamble, epilogue);
}

function BodyPart() {
    this['Content-Type'] = null;
    this['Content-Transfer-Encoding'] = null;
    this['Content-ID'] = null;
    this['Content-Description'] = null;
    this['Content-Location'] = null;
    this['Content-Disposition'] = null;
    this._payload = null;
    return Multipart.call(this);
}

/**
 * Extend Multipart since a BodyPart can also be multipart.
 * @type {Multipart}
 */
BodyPart.prototype = new Multipart();
BodyPart.prototype.constructor = BodyPart;

/**
 * Accessor methods.
 * setType allows you to set the Content-Type header field.
 * setTransferEncoding allows you to set the Content-Transfer-Encoding header field.
 * setId allows you to set the Content-ID header field.
 * setDescription allows you to set the Content-Description header field.
 * setLocation allows you to set the Content-Location header field.
 * setDisposition allows you to set the Content-Disposition header field.
 * setPayload allows you to set the *OCTET. This can be a string of an serialized media type including Multipart.
 */
BodyPart.method('setType', function (type) {
    this['Content-Type'] = (typeof type === 'string') ? type : this['Content-Type'];
    return this;
});

BodyPart.method('setTransferEncoding', function (encoding) {
    this['Content-Transfer-Encoding'] = (typeof encoding === 'string') ? encoding : this['Content-Transfer-Encoding'];
    return this;
});

BodyPart.method('setId', function (id) {
    this['Content-ID'] = (typeof id === 'string') ? id : this['Content-ID'];
    return this;
});

BodyPart.method('setDescription', function (description) {
    this['Content-Description'] = (typeof description === 'string') ? description : this['Content-Description'];
    return this;
});

BodyPart.method('setLocation', function (location) {
    this['Content-Location'] = (typeof location === 'string') ? location : this['Content-Location'];
    return this;
});

BodyPart.method('setDisposition', function (disposition) {
    this['Content-Disposition'] = (typeof disposition === 'string') ? disposition : this['Content-Disposition'];
    return this;
});

BodyPart.method('setPayload', function (payload) {
    this._payload = (typeof payload === 'string' || payload instanceof Multipart) ? payload : this._payload;
    return this;
});

/**
 * Utility method to serialize the BodyPart entity to String.
 * @return String representing the BodyPart entity and any potential nested Multipart instances.
 */
BodyPart.method('toString', function () {
    var entityHeaders = '',
        payload = this._payload,
        payloadExists = !!(payload),
        payloadIsMultipart = (payload instanceof Multipart);

    /**
     * If the payload of this body part is an instance of Multipart, then set the Content-Type explicitly with
     * the subtype specified in the Multipart instance and the boundary generated in this BodyPart instance.
     * @type {String}
     */
    this['Content-Type'] = ((payloadIsMultipart) ?
        ('multipart/' + payload._subtype + '; boundary="' + this._boundary + '"') : this['Content-Type']);

    /**
     * Serialize the Content- headers. Any other headers are ignored.
     */
    for (var header in this) {
        if (header.lastIndexOf('Content-') !== -1 && this[header]) {
            entityHeaders += header + ': ' + this[header] + crlf;
        }
    }

    /**
     * Concatenate the *OCTET payload to the serialized Content- headers. The *OCTET may be an instance of Multipart, or
     * a payload of a different media type altogether.
     */
    return entityHeaders + ((payloadExists) ? crlf +
        ((payloadIsMultipart) ? payload.setBoundary(this._boundary).toString() : payload) : '');
});

function bodypart() {
    return new BodyPart();
}

module.exports.bodypart = exports.bodypart = module.exports.bp = exports.bp = bodypart;
module.exports.multipart = exports.multipart = module.exports.mp = exports.mp = multipart;
