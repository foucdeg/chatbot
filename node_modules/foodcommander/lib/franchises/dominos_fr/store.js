'use strict';
var request = require('request');
var Q = require("q");
var sprintf = require('sprintf-js').sprintf;
var cheerio = require('cheerio');

var model = require('../../model.js');
var config = require('./config.js');
var textUtil = require('../../textUtil.js');

var searchByPostalCode = function(postalCode) {

    var deferred = Q.defer();

    var requestOptions = {
        url: sprintf(config.searchUri, postalCode),
        headers: {
            'Accept': 'text/html',
            'User-Agent': config.userAgent
        }
    };

    request(requestOptions, function(error, response, body) {

        if (!error) {

            // Make shure parsing is async
            process.nextTick(function() {

                if (response.statusCode === 200) {

                    var stores = [];

                    // Parse content
                    var $ = cheerio.load(response.body);
                    var $storeRootElem = $('.store-search-results');
                    $storeRootElem.find('.store-information').each(function(i, element) {

                        var store = new model.Store();
                        var $this = $(this);
                        store.name = $this.children('h4').children().text().normalize();
                        store.address = $this.find('.no-underline').text().trim().normalize();
                        store.phone = $this.find('.no-underline').next().text().trim().normalize();
                        store.id = $this.children('p').next().attr('id').replace('store-menu-','');


                        stores.push(store);
                    });

                    deferred.resolve(stores);

                } else {
                    deferred.reject(new Error(sprintf('Request failed with status %d', response.statusCode)));
                }

            });

        } else {
            deferred.reject(error);
        }

    });

    return deferred.promise;
};



module.exports = {

    searchByPostalCode: searchByPostalCode
};
