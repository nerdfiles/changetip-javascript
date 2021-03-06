"use strict";
var util = require('util');

/**
 * Error Exception Lookup
 * @enum {string}
 * @memberOf ChangeTipException
 */
var ChangeTipExceptions = {
    /** API Key was not set. This must be set during construction or by running init */
    300: "No API_KEY set. Call init prior to any remote API calls",
    /** Channel was not defined for remote call */
    301: "Channel is undefined, must be set prior to any remote API calls",
    /** API version not supported. */
    400: "API version not supported",
    /** User ID required. **/
    401: "User ID require",
    /** Text Amount or Message was not defined. */
    402: "Text Amount or Message were not provided",
    /** Text Amount or Address was not defined. */
    403: "Text Amount or Address were not provided",
    /** Moniker require. */
    404: "Moniker require",
    /** Generic error. */
    500: 'Something is amiss!'
};

/**
 * Change Tip Exception
 * @param {number} code Error code for this exception
 * @constructor
 */
var ChangeTipException = function(code) {
    this.name = "ChangeTipException";
    this.code = code;
    ChangeTipException.super_.call(this, ChangeTipExceptions[code]);
};

util.inherits(ChangeTipException, Error);

/** ChangeTipException Class */
module.exports = ChangeTipException;
