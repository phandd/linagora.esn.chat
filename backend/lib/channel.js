'use strict';

var CONSTANTS = require('../lib/constants');
var CHANNEL_CREATION = CONSTANTS.NOTIFICATIONS.CHANNEL_CREATION;
var TOPIC_UPDATED = CONSTANTS.NOTIFICATIONS.TOPIC_UPDATED;
var async = require('async');

module.exports = function(dependencies) {

  var mongoose = dependencies('db').mongo.mongoose;
  var ObjectId = mongoose.Types.ObjectId;
  var Channel = mongoose.model('ChatChannel');
  var ChatMessage = mongoose.model('ChatMessage');

  var pubsubGlobal = dependencies('pubsub').global;
  var channelCreationTopic = pubsubGlobal.topic(CHANNEL_CREATION);
  var updateChannelTopic = pubsubGlobal.topic(TOPIC_UPDATED);

  function getChannels(options, callback) {
    Channel.find({type: 'channel'}).populate('members').exec(function(err, channels) {
      channels = channels || [];
      if (channels.length === 0) {
        return createChannel(CONSTANTS.DEFAULT_CHANNEL, function(err, channel) {
          if (err) {
            return callback(new Error('Can not create the default channel'));
          }
          callback(null, [channel]);
        });
      }
      callback(err, channels);
    });
  }

  function getChannel(channel, callback) {
    Channel.findById(channel).populate('members').exec(callback);
  }

  function deleteChannel(channel, callback) {
    Channel.findByIdAndRemove(channel, callback);
  }

  function findGroupByMembers(exactMatch, members, callback) {
    var request = {
      type:  'group',
      members: {
        $all: members.map(function(participant) {
          return new ObjectId(participant);
        })
      }
    };

    if (exactMatch) {
      request.members.$size = members.length;
    }

    Channel.find(request).populate('members').exec(callback);
  }

  function createChannel(options, callback) {
    async.waterfall([
        function(callback) {
          var channel = new Channel(options);
          channel.save(callback);
        },
        function(channel, _num, callback) {
          Channel.populate(channel, 'members', callback);
        },
        function(channel, callback) {
          channelCreationTopic.publish(JSON.parse(JSON.stringify(channel)));
          callback(null, channel);
        }
    ], callback);
  }

  function createMessage(message, callback) {
    var chatMessage = new ChatMessage(message);
    return chatMessage.save(callback);
  }

  function addMemberToChannel(channelId, userId, callback) {
    Channel.update({_id: channelId}, {
      $addToSet: {members: new ObjectId(userId)}
    }, callback);
  }

  function removeMemberFromChannel(channelId, userId, callback) {
    Channel.update({_id: channelId}, {
      $pull: {members: new ObjectId(userId)}
    }, callback);
  }

  function getMessages(channel, query, callback) {
    query = query || {};
    var channelId = channel._id || channel;
    var q = {channel: channelId};
    var mq = ChatMessage.find(q);
    mq.populate('creator');
    mq.limit(query.limit || 20);
    mq.skip(query.offset || 0);
    mq.sort('-timestamps.creation');
    mq.exec(callback);
  }

  function updateTopic(channelId, topic, callback) {
    Channel.findByIdAndUpdate({_id: channelId}, {
      $set: {
        topic: {
          value: topic.value,
          creator: topic.creator,
          last_set: topic.last_set
        }
      }
    }, function(err, channel) {
      var message = {
        type: 'text',
        subtype: 'channel:topic',
        date: Date.now(),
        channel: String(channel._id),
        user: String(topic.creator),
        topic: {
          value: channel.topic.value,
          creator: String(channel.topic.creator),
          last_set: channel.topic.last_set
        },
        text: 'set the channel topic: ' + topic.value,
      };
      updateChannelTopic.publish(message);
      callback(err, channel);
    });
  }

  return {
    getMessages: getMessages,
    addMemberToChannel: addMemberToChannel,
    removeMemberFromChannel: removeMemberFromChannel,
    findGroupByMembers: findGroupByMembers,
    createMessage: createMessage,
    createChannel: createChannel,
    getChannel: getChannel,
    getChannels: getChannels,
    deleteChannel: deleteChannel,
    updateTopic: updateTopic
  };
};