(function() {
  'use strict';

  angular.module('linagora.esn.chat')
    .factory('chatConversationsStoreService', chatConversationsStoreService);

  function chatConversationsStoreService($log, _, CHAT_CONVERSATION_TYPE, CHAT_EVENTS, CHAT_MEMBER_STATUS) {
    var activeRoom = {};
    var store = {
      addConversation: addConversation,
      addConversations: addConversations,
      addMembers: addMembers,
      channels: [],
      conversations: [],
      deleteConversation: deleteConversation,
      findConversation: findConversation,
      find: find,
      getNumberOfUnreadedMessages: getNumberOfUnreadedMessages,
      isActiveRoom: isActiveRoom,
      joinConversation: joinConversation,
      leaveConversation: leaveConversation,
      markAllMessagesAsRead: markAllMessagesAsRead,
      privateConversations: [],
      setActive: setActive,
      unsetActive: unsetActive,
      updateConversation: updateConversation,
      updateTopic: updateTopic,
      get activeRoom() {
        return activeRoom;
      }
    };

    return store;

    //////////

    function addConversation(conversation) {
      if (!findConversation(conversation._id)) {
        insertConversationInSortedArray(store.conversations, conversation);
        if (conversation.type === CHAT_CONVERSATION_TYPE.OPEN) {
          insertConversationInSortedArray(store.channels, conversation);
        } else if (conversation.type === CHAT_CONVERSATION_TYPE.CONFIDENTIAL) {
          insertConversationInSortedArray(store.privateConversations, conversation);
        }
      }
    }

    function addConversations(conversations) {
      conversations && conversations.forEach(function(conversation) {
        addConversation(conversation);
      });
    }

    function addMembers(conversation, members) {
      var conv = findConversation(conversation._id);

      if (!conv) {
        addConversation(conversation);
        conversation.members = members;

        return;
      }

      conv.members = members;
    }

    function deleteConversation(conversation) {
      var array = [];

      conversation = !conversation._id ? _.find(store.conversations, {_id: conversation}) : conversation;

      if (!conversation) {
        return $log.warn('Trying to delete a conversation that does not exist');
      }

      if (conversation.type === CHAT_CONVERSATION_TYPE.OPEN) {
        array = store.channels;
      } else if (conversation.type === CHAT_CONVERSATION_TYPE.CONFIDENTIAL) {
        array = store.privateConversations;
      }

      _.remove(array, {_id: conversation._id});
      _.remove(store.conversations, {_id: conversation._id});
    }

    function findConversation(conversationId) {
      return _.find(store.conversations, {_id: conversationId});
    }

    function find(filter) {
      return _.find(store.conversations, filter);
    }

    function getNumberOfUnreadedMessages() {
      var unreadedMessages = 0;

      store.conversations.forEach(function(conversation) {
        unreadedMessages = unreadedMessages + (conversation.unreadMessageCount || 0);
      });

      return unreadedMessages;
    }

    function insertConversationInSortedArray(array, conversation) {
      var index = _.sortedIndex(array, conversation, function(conversation) {
        if (!conversation.last_message || !conversation.last_message.date) {
          return -(new Date());
        }

        return -(new Date(conversation.last_message.date));
      });

      array.splice(index, 0, conversation);
    }

    function isActiveRoom(conversationId) {
      if (!conversationId) {
        return false;
      }

      return conversationId === activeRoom._id;
    }

    function joinConversation(conversation) {
      if (!conversation) {
        return;
      }
      conversation.member_status = CHAT_MEMBER_STATUS.MEMBER;

      return addConversation(conversation);
    }

    function leaveConversation(conversation) {
      return deleteConversation(conversation);
    }

    function markAllMessagesAsRead(conversation) {
      var conv = findConversation(conversation._id);

      if (conv) {
        conv.unreadMessageCount = 0;
      }
    }

    function setActive(conversationId) {
      var conversation;

      if (isActiveRoom(conversationId)) {
        return true;
      }

      conversation = findConversation(conversationId);
      if (!conversation) {
        return false;
      }

      conversation.mentionCount = 0;
      conversation.unreadMessageCount = 0;
      activeRoom = conversation;

      return true;
    }

    function unsetActive() {
      activeRoom = {};
    }

    function updateConversation(conversation) {
      var conv = findConversation(conversation._id);

      if (!conv) {
        addConversation(conversation);

        return;
      }

      conv.name = conversation.name;
      conv.members = conversation.members;
      conv.avatar = conversation.avatar;
    }

    function updateTopic(conversation, topic) {
      var conv = findConversation(conversation._id);

      if (!conv) {
        conversation.topic = {value: topic};
        addConversation(conversation);

        return;
      }

      conv.topic = {value: topic};
    }
  }
})();
