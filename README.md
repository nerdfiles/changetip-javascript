# ChangeTip API for NodeJS ![CircleCI Build Status](https://circleci.com/gh/changecoin/changetip-javascript.svg?style=shield&circle-token=:circle-token)
<<<<<<< HEAD
Enables easy communication with the ChangeTip API via NodeJS. Allows for sending and retrieving tip information.

Now supports most of v2 API.
=======
Enables easy communication with the ChangeTip API via NodeJS. Allows for sending and retrieving tip information
>>>>>>> b8b7a636ad06c61c225af71eced7b2faa17272a7

## Installation
    
    npm install changetip

## Instance Usage
````javascript
	var ChangeTip = require('changetip'),
    	change_tip = new ChangeTip({api_key:{YOUR_KEY_HERE});
    	
<<<<<<< HEAD
    change_tip.send_tip(uniqueId, contextUrl, sender, receiver, channel).then(function(result) {
=======
    change_tip.send_tip(uniqueId, sender, receiver, channel, meta).then(function(result) {
>>>>>>> b8b7a636ad06c61c225af71eced7b2faa17272a7
    	//Results here from transaction
    });
````

## Singleton Usage
````javascript
    var change_tip = require('changetip').getInstance();

    //Only needed once
    change_tip.init({api_key:{YOUR_KEY_HERE});
    
    change_tip.send_tip(uniqueId, sender, receiver, channel, meta).then(function(result) {
    	//Results here from transaction
    });
````

## API Development

1. Clone repo locally

		git clone https://github.com/changecoin/changetip-javascript.git

2. Install Node Modules

		npm install

## Generating Docs
	
	npm run docs

## Running Unit Tests
To run Unit Tests:

<<<<<<< HEAD
    npm run test
=======
    npm run test
>>>>>>> b8b7a636ad06c61c225af71eced7b2faa17272a7
