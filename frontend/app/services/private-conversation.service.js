(function() {
  'use strict';

  angular.module('linagora.esn.chat')
    .factory('chatPrivateConversationService', chatPrivateConversationService);

    function chatPrivateConversationService(ChatRestangular) {

      return {
        get: get,
        store: store
      };

      function _stripResponse(response) {
        return ChatRestangular.stripRestangular(response.data);
      }

      function get() {
        return ChatRestangular.one('user').all('privateConversations').getList().then(_stripResponse);
      }

      function store(conversationIds) {
        ChatRestangular.one('user').all('privateConversations').doPUT({
          conversationIds: conversationIds
        });
      }
    }
})();
