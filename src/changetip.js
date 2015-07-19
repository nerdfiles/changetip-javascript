"use strict";

try {
    var Q = require('q');
} catch (e) {
    var Q = require('Q');
}
var request = require('request');

var https = require('https'),
    querystring = require('querystring'),
    Methods = {
        GET: "GET",
        POST: "POST"
    },
    ChangeTipException                    = require('./changetip-exception'),
    CHANGETIP_DEFAULT_VERSION             = "2",
    CHANGETIP_DEFAULT_HOST                = "api.changetip.com",
    CHANGETIP_DEFAULT_AUTH_HOST           = "www.changetip.com",
    CHANGETIP_DEFAULT_AUTH_HOST_BASE      = '/o'
    CHANGETIP_DEFAULT_AUTH_HOST_AUTHORIZE = '/authorize'
    CHANGETIP_DEFAULT_AUTH_HOST_TOKEN     = '/token'
    CHANGETIP_DEFAULT_AUTHENTICATION_TYPE = "access_token",
    CHANGETIP_LOG_LEVEL                   = 2,
    instance;

var oauth2lib = require('oauth20-provider');
var oauth2 = new oauth2lib({
    log: {
        level: CHANGETIP_LOG_LEVEL
    }
});


/**
 * @typedef ChangeTipConfig
 * @type {object}
 * @property {string} api_key_or_access_token API Key for ChangeTip
 * @property {string} host Host URL for all remote API requests (defaults to CHANGETIP_DEFAULT_HOST)
 * @property {number} api_version Base URL for all remote API requests (defaults to CHANGETIP_DEFAULT_VERSION)
 * @property {string} authentication_type Choose to pass either an API Key or an Access Token (defaults to CHANGETIP_DEFAULT_AUTHENTICATION_TYPE)
 */


/**
 * ChangeTip API
 * @param {ChangeTipConfig} [config]
 * @constructor
 */
var ChangeTip = function (config) {
    // If information was passed to constructor auto init
    if (config) {
        this.init(config);
    }
};

ChangeTip.prototype = {

    /**
     * API Key from ChangeTip. Request one from the {@link htps://www.changetip.com/api|ChangeTip API} website.'
     * @public
     * @property {string} api_key_or_access_token
     */
    set api_key_or_access_token(value) {
        this._api_key_or_access_token = value;
    },

    get api_key_or_access_token() {
        return this._api_key_or_access_token;
    },

    /**
     * Authentication Type to configure ChangeTip requests.
     * @public
     * @property {string} authentication_type access_token|api_key
     */
    set authentication_type(value) {
        this._authentication_type = value;

    },

    get authentication_type () {
        return this._authentication_type || CHANGETIP_DEFAULT_AUTHENTICATION_TYPE;
    },

    /**
     * Host used for all ChangeTip remote requests (api.changetip.com)
     * @public
     * @property {string} host
     */
    set host(value) {
        this._host = value;
    },

    get host() {
        return this._host || CHANGETIP_DEFAULT_HOST;
    },

    /**
     * API Version to use for all ChangeTip remote requests (v1)
     * @public
     * @property {number} api_version
     */
    set api_version(value) {
        this._api_version = value;
    },

    get api_version() {
        return this._api_version || CHANGETIP_DEFAULT_VERSION;
    },

    /**
     * Development Mode configuration.
     */
    set dev_mode(value) {
        this._dev_mode = !!value;
    },

    get dev_mode() {
        return this._dev_mode || false
    },

    /**
     * Initializes the class for remote API Calls
     * @param {ChangeTipConfig} config
     * @returns {ChangeTip}
     */
    init: function (config) {

        config                   = config || {};
        this.api_key_or_access_token    = config.api_key_or_access_token || undefined;
        this.authentication_type = config.authentication_type || undefined;
        this.host                = config.host || undefined;
        this.api_version         = config.api_version || undefined;
        this.dev_mode            = config.dev_mode || false;
        return this;
    },


    /**
      * Get Token
      *
      * @param {object} credentials
      * @param {object} request
      * @param {function} success Success condition callback.
      * @param {function} fail Error condition callback.
      * @return {undefined}
      */
    get_token = function(credentials, req, success, fail){
      if (!req)  console.log('No authorization request object provided: Are you sure about that?')
      if (!success)  console.log('No callback provided for authorization success: Are you sure about that?')
      if (!fail)  console.log('No callback provided for authorization failure: Are you sure about that?')
      if (!credentials)  throw new ChangeTipException(500);

      var urlSep = '';

      var authorizationUrl = [
        CHANGETIP_DEFAULT_AUTH_HOST
        CHANGETIP_DEFAULT_AUTH_HOST_BASE
        CHANGETIP_DEFAULT_AUTH_HOST_AUTHORIZE
      ].join urlSep

      var token;
      var credentials = credentials.changeTip.oauth2;
      //var other_credentials=credentials.fetch('other');

      var token_request='code='+req['query']['code'] +
          '&client_id='+google_credentials['client_id'] +
          '&client_secret='+google_credentials['client_secret'] +
          '&redirect_uri=http%3A%2F%2Fmyurl.com:3000%2Fauth' +
          '&grant_type=authorization_code';

      var request_length = token_request.length;

      console.log("requesting: " + token_request);

      request(
          {
            method  : 'POST',
            uri     : 'https://accounts.google.com/o/oauth2/token',
            body    : token_request,
            headers : {
              'Content-length' : request_length,
              'Content-type'   : 'application/x-www-form-urlencoded'
            }
          },
          function (error, response, body) {
              if(response.statusCode == 200){
                  console.log('document fetched');
                  token=body['access_token'];
                  store_token(body);
                  if(success){
                      success(token);
                  }
              }
              else {
                  console.log('error: '+ response.statusCode);
                  console.log(body)
                  if(fail){
                      fail();
                  }
              }
          }
      );
    },


    /**
     * Sends a tip via the ChangeTip API
     * @param context_uid {number|string} Unique ID for this tip
     * @param {number|string} sender username/identifier for the tip sender
     * @param {number|string} receiver username/identifier for the tip receiever
     * @param {string} channel Origin channel for this tip (twitter, github, slack, etc)
     * @param {string} message Tip message. Includes amount or moniker.
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    send_tip: function (context_uid, context_url, sender, receiver, channel, message) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (!channel) throw new ChangeTipException(301);
        if (!receiver || !context_uid || !context_url || !message) throw new ChangeTipException(500);

        var deferred = Q.defer(),
            data;

        data = {
            message     : message,
            receiver    : receiver,
            context_uid : context_uid,
            context_url : context_url,
            sender      : sender,
            channel     : channel
        };

        this._send_request(data, 'tip', null, Methods.POST, deferred);
        return deferred.promise;
    },


    /**
     * List of Monikers.
     * @param {number} pageNumber
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    monikers: function (pageNumber) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);

        var deferred = Q.defer(),
            params;

        params = {
            page: pageNumber || 1
        };

        this._send_request({}, 'monikers', params, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * List of Currencies.
     * @param {number} pageNumber
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    currencies: function (pageNumber) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);

        var deferred = Q.defer(),
            params;

        params = {
            page: pageNumber || 1
        };

        this._send_request({}, 'currencies', params, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * Get User.
     * @param {number} userId
     * @param {boolean} full
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    user: function (userId, full) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);
        if (!userId) throw new ChangeTipException(401)

        var deferred = Q.defer(),
            params;

        params = {
            full: full || false
        };

        this._send_request({}, 'users/' + userId, params, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * List of Users.
     * @param {number} pageNumber
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    users: function (pageNumber) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);

        var deferred = Q.defer(),
            params;

        params = {
            page: pageNumber || 1
        };

        this._send_request({}, 'users', params, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * List of Transactions.
     * @param {number} pageNumber
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    transactions: function (pageNumber) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);

        var deferred = Q.defer(),
            params;

        params = {
            page: pageNumber || 1
        };

        this._send_request({}, 'transactions', params, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * Create Tip URL.
     * @param {number} text_amount
     * @param {string} moniker
     * @param {string} message
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    tip_url: function (amount, moniker, message) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (!amount) throw new ChangeTipException(402);
        if (!moniker) throw new ChangeTipException(404);
        if (!message) throw new ChangeTipException(402);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);

        var deferred = Q.defer(),
            data;

        data = {
            amount  : amount + ' ' + moniker,
            message : message
        };
        console.dir(data);

        this._send_request(data, 'tip-url', null, Methods.POST, deferred);
        return deferred.promise;
    },


    /**
     * Get Wallet Withdrawals
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    get_wallet_withdrawals: function() {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);

        var deferred = Q.defer();

        this._send_request({}, 'wallet/withdrawals', null, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * Post Wallet Withdrawals
     * @param {number} amount
     * @param {string} address
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    post_wallet_withdrawals: function(amount, address) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);
        if (!amount) throw new ChangeTipException(403);
        if (!address) throw new ChangeTipException(403);

        var deferred = Q.defer(),
            data;

        data = {
            amount  : amount,
            address : address
        };

        this._send_request(data, 'wallet/withdrawals', null, Methods.POST, deferred);
        return deferred.promise;
    },


    /**
     * Retrieve wallet balance.
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    get_wallet_balance: function () {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);

        var deferred = Q.defer();

        this._send_request({}, 'wallet/balance', null, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * Retrieve wallet address of user.
     * @param {string} username
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    get_wallet_address: function (username) {
        if (!this.api_key_or_access_token) throw new ChangeTipException(300);
        if (this.api_version === CHANGETIP_DEFAULT_VERSION) throw new ChangeTipException(400);

        var deferred = Q.defer(),
            params;

        params = {
            username: username
        };

        this._send_request({}, 'wallet/address', params, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * Retrieve tips from the ChangeTip API
     * @param {string|string[]} tips Single or collection of tip identifiers to retrieve
     * @param {string} [channel] Channel to filter results. (github, twitter, slack, etc)
     * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|l.promise}
     */
    get_tip: function (tips, channel) {
        if (!this.api_key) throw new ChangeTipException(300);

        var deferred = Q.defer(),
            params;

        params = {
            tips    : tips instanceof Array ? tips.join(",") : tips,
            channel : channel || ''
        };

        this._send_request({}, 'tips', params, Methods.GET, deferred);
        return deferred.promise;
    },


    /**
     * Sends a request
     * @param {Object} data JSON Object with data payload
     * @param {String} path API Path
     * @param {Object} params Query Parameters to be sent along with this request
     * @param {Methods} method HTTP Method
     * @param deferred Deferred Object
     * @param deferred.promise Deferred Promise Object
     * @param deferred.resolve Deferred success function
     * @param deferred.reject Deferred rejection function
     * @private
     */
    _send_request: function (data, path, params, method, deferred) {

        var options, query_params, req, authorizedUrl, querifiedPath,
            dataString = JSON.stringify(data);

        querifiedPath = '/v' + this.api_version + '/' + path + '/?' + this.authentication_type + '=' + this.api_key_or_access_token + (query_params ? ('&' + query_params) : '')

        options = {
            host    : this.host,
            port    : 443,
            body    : data,
            path    : querifiedPath,
            method  : method,
            headers : {
                'Content-Type'   : 'multipart/form-data',
                'Content-Length' : dataString.length
            }
        };

        if (!this.dev_mode) {

            authorizedUrl = 'https://' + this.host + '/v' + this.api_version + '/' + path + '/?' + this.authentication_type + '=' + this.api_key_or_access_token

            if (method === 'POST') {

                request.post({
                    url              : authorizedUrl,
                    formData         : data,
                    'Content-Length' : dataString.length
                }, function optionalCallback(err, httpResponse, body) {

                    if (err) {
                        //deferred.resolve(err);
                        deferred.reject(err);
                        return
                    }

                    deferred.resolve(body);

                });

            } else {

                request.get({
                  url : authorizedUrl,
                  qs  : params
                }, function optionalCallback(err, httpResponse, body) {

                    if (err) {
                        //deferred.resolve( err );
                        deferred.reject( err );
                        return
                    }

                    deferred.resolve(body);

                });

            }

        } else {

            deferred.resolve({
                status : "dev_mode",
                data   : data,
                params : params,
                path   : options.path
            });

        }

        return
    }

};

/**
 * Accessor for ChangeTip Singleton
 * @returns {ChangeTip}
 */
ChangeTip.get_instance = function () {
    if (!instance) {
        instance = new ChangeTip();
    }
    return instance;
};

/** ChangeTip Class */
module.exports = ChangeTip;
