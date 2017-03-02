(function() {
  'use strict';

  angular.module('linagora.esn.chat')
    .controller('chatBotMessageController', chatBotMessageController);

    function chatBotMessageController($q, $log, chatBotMessageService, CHAT_MESSAGE_DISPLAYABLE_TYPES) {
      var self = this;

      self.$onInit = $onInit;

      function $onInit() {
        self.botUser = {
          displayName: CHAT_MESSAGE_DISPLAYABLE_TYPES.BOT,
          avatarUrl: '/chat/images/bot-user.png'
        };

        chatBotMessageService.resolve(self.message.subtype, self.message).then(function(message) {
          self.parsed = {
            text: message
          };
        }).catch(function(err) {
          $log.error('Error while resolving bot message', err);
          self.hasBotError = true;

          return $q.reject(err);
        });
      }
    }
})();
