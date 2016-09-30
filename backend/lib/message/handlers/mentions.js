'use strict';

const CONSTANTS = require('../../constants');

module.exports = function(dependencies) {

  let pubsub = dependencies('pubsub').global;

  return function(data) {
    data.message.user_mentions && data.message.user_mentions.forEach(mention => {
      pubsub.topic(CONSTANTS.NOTIFICATIONS.USERS_MENTION).publish({room: data.room, message: data.message, for: mention});
    });
  };

};
