'use strict';

/* eslint-disable no-console */
const logger = require('../modules/logger');

const grantedBasicAuthUsername = process.env['BASIC_AUTH_USERNAME'];
const grantedBasicAuthPassword = process.env['BASIC_AUTH_PASSWORD'];

const handlerFunc = (username, password) => {
    const ret = (username === grantedBasicAuthUsername) && (password === grantedBasicAuthPassword);

    if (!ret) {
        logger.app.error("Invalid BasicAuth username=" + username + ", password=" + password);
    }

    return ret;
};

module.exports = handlerFunc;
