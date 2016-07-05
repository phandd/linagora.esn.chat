'use strict';

/* global chai, sinon: false */
var expect = chai.expect;

describe('the ChatTextEntitySelector constructor', function() {
  var scope, entityList, $rootScope, KEY_CODE, ChatTextEntitySelector, entitySelector;

  beforeEach(module('linagora.esn.chat'));

  beforeEach(inject(function(_$rootScope_, _ChatTextEntitySelector_, _KEY_CODE_) {
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
    KEY_CODE = _KEY_CODE_;
    ChatTextEntitySelector = _ChatTextEntitySelector_;
    entityList = ['smile_a', 'smile_b', 'smile_c', 'smile_ko', 'smile_ok'];
    entitySelector = new ChatTextEntitySelector(ChatTextEntitySelector.entityListResolverFromList(entityList), ':', '#');
  }));

  function getTextAreaAdapter(selectionStart, selectionEnd, text) {
    return {
      value: text,
      selectionStart: selectionStart,
      selectionEnd: selectionEnd,
      replaceText: sinon.spy()
    };
  }

  describe('ChatTextEntitySelector.entityListResolverFromList', function() {
    var list, resolver, thenSpy;

    beforeEach(function() {
      list = ['atom', 'batman', 'kitten', 'koala'];
      resolver = ChatTextEntitySelector.entityListResolverFromList(list);
      thenSpy = sinon.spy();
    });

    it('should return a promess of strings starting with the given string', function() {
      resolver('k').then(thenSpy);
      $rootScope.$digest();
      expect(thenSpy).to.have.been.calledWith(['kitten', 'koala']);
      resolver('a').then(thenSpy);
      $rootScope.$digest();
      expect(thenSpy.secondCall).to.have.been.calledWith(['atom']);
    });

    it('should return an empty array if none', function() {
      resolver('boa').then(thenSpy);
      $rootScope.$digest();
      expect(thenSpy).to.have.been.calledWith([]);
    });
  });

  describe('textChanged method', function() {
    it('should switch state to visible when the text is :something', function() {
      entitySelector.textChanged(getTextAreaAdapter(6, 6, ':smile'));
      $rootScope.$digest();
      expect(entitySelector.visible).to.be.true;
      expect(entitySelector.entityStart).to.equal('smile');
    });

    it('should switch state to not visible when the emoji becomes unkonwn', function() {
      entitySelector.textChanged(getTextAreaAdapter(6, 6, ':smile'));
      $rootScope.$digest();
      expect(entitySelector.visible).to.be.true;
      expect(entitySelector.entityStart).to.equal('smile');
      entitySelector.textChanged(getTextAreaAdapter(7, 7, ':smilee'));
      $rootScope.$digest();
      expect(entitySelector.visible).to.be.false;
    });

    it('should not switch state to visible when the emoji text is not in the list', function() {
      entitySelector.textChanged(getTextAreaAdapter(6, 6, ':micro'));
      $rootScope.$digest();
      expect(entitySelector.visible).to.be.false;
    });

    it('should not switch state to visible when text is selected', function() {
      entitySelector.textChanged(getTextAreaAdapter(3, 6, ':smile'));
      $rootScope.$digest();
      expect(entitySelector.visible).to.be.false;
    });

    it('should switch state to not visible when text is selected', function() {
      entitySelector.textChanged(getTextAreaAdapter(6, 6, ':smile'));
      $rootScope.$digest();
      expect(entitySelector.visible).to.be.true;
      entitySelector.textChanged(getTextAreaAdapter(3, 6, ':smile'));
      $rootScope.$digest();
      expect(entitySelector.visible).to.be.false;
    });
  });

  describe('keyDown method', function() {

    function getEvt(keyCode) {
      return {
        keyCode: keyCode,
        preventDefault: sinon.spy()
      };
    }

    describe('reaction to enter event', function() {
      it('should call self.select with the selected emoji', function() {
        entitySelector.textChanged(getTextAreaAdapter(6, 6, ':smile'));
        $rootScope.$digest();
        entitySelector.focusIndex = 1;
        entitySelector.select = sinon.spy();

        entitySelector.keyDown(getEvt(KEY_CODE.ENTER));
        expect(entitySelector.select).to.have.been.calledWith('smile_b');
      });
    });

    describe('ArrowUp/ArrowLeft event', function() {
      it('should update the selected emoji index', function() {
        entitySelector.textChanged(getTextAreaAdapter(6, 6, ':smile'));
        $rootScope.$digest();

        [
          { event: getEvt(KEY_CODE.ARROW_UP), expected: 4 },
          { event: getEvt(KEY_CODE.ARROW_UP), expected: 3 },
          { event: getEvt(KEY_CODE.ARROW_LEFT), expected: 2 },
          { event: getEvt(KEY_CODE.ARROW_LEFT), expected: 1 },
        ].forEach(function(testSpec) {
          entitySelector.keyDown(testSpec.event);
          expect(entitySelector.focusIndex).to.equal(testSpec.expected);
        });
      });
    });

    describe('ArrowDown/ArrowRight/Tab event', function() {
      it('should update the selected emoji index', function() {
        entitySelector.textChanged(getTextAreaAdapter(6, 6, ':smile'));
        $rootScope.$digest();

        [
          { event: getEvt(KEY_CODE.ARROW_DOWN), expected: 1 },
          { event: getEvt(KEY_CODE.ARROW_DOWN), expected: 2 },
          { event: getEvt(KEY_CODE.ARROW_RIGHT), expected: 3 },
          { event: getEvt(KEY_CODE.TAB), expected: 4 },
          { event: getEvt(KEY_CODE.ARROW_RIGHT), expected: 0 }
        ].forEach(function(testSpec) {
          entitySelector.keyDown(testSpec.event);
          expect(entitySelector.focusIndex).to.equal(testSpec.expected);
        });
      });

      it('should not update the selected emoji index if there is a meta key with Tab', function() {
        entitySelector.textChanged(getTextAreaAdapter(6, 6, ':smile'));
        $rootScope.$digest();

        [
          {evt: getEvt('Tab'), k: 'altKey'},
          {evt: getEvt('Tab'), k: 'ctrlKey'},
          {evt: getEvt('Tab'), k: 'metaKey'},
          {evt: getEvt('Tab'), k: 'shiftKey'}
        ].forEach(function(testSpec) {
          testSpec.evt[testSpec.k] = true;
          entitySelector.keyDown(testSpec.evt);
          expect(entitySelector.focusIndex).to.equal(0);
        });
      });

    });

    describe('event.which', function() {

      function getEvt(keyCode) {
        return {
          which: keyCode,
          preventDefault: sinon.spy()
        };
      }

      it('should use event.which if event.keyCode is undefined', function() {
        entitySelector.textChanged(getTextAreaAdapter(6, 6, ':smile'));
        $rootScope.$digest();
        entitySelector.focusIndex = 1;
        entitySelector.select = sinon.spy();

        entitySelector.keyDown(getEvt(KEY_CODE.ENTER));
        expect(entitySelector.select).to.have.been.calledWith('smile_b');
      });
    });
  });

  describe('select() method', function() {
    it('should update the textarea text', function() {
      var adapter = getTextAreaAdapter(6, 6, ':smile');
      entitySelector.textChanged(adapter);
      $rootScope.$digest();
      entitySelector.select('smile_c');
      expect(adapter.replaceText).to.have.been.calledWith(':smile_c#', 9, 9);
    });

    it('should update the textarea text in the middle of text', function() {
      var adapter = getTextAreaAdapter(20, 20, ':smile_a# test :smil test');
      entitySelector.textChanged(adapter);
      $rootScope.$digest();
      entitySelector.select('smile_c');
      expect(adapter.replaceText).to.have.been.calledWith(':smile_a# test :smile_c# test', 24, 24);
    });

    it('should not be confused when there is two times the same emoji start', function() {
      var adapter = getTextAreaAdapter(18, 18, ':smile test :smile test');
      entitySelector.textChanged(adapter);
      $rootScope.$digest();
      entitySelector.select('smile_c');
      expect(adapter.replaceText).to.have.been.calledWith(':smile test :smile_c# test', 21, 21);
    });

    it('should use the given toString method if one his provided', function() {
      var toStringMockResult = 'toStringMockResult';
      var toStringMock = sinon.stub().returns(toStringMockResult);
      var adapter = getTextAreaAdapter(6, 6, ':smile');

      entitySelector = new ChatTextEntitySelector(ChatTextEntitySelector.entityListResolverFromList(entityList), ':', '#', toStringMock);
      entitySelector.textChanged(adapter);
      $rootScope.$digest();
      entitySelector.select('smile_c');

      var size = toStringMockResult.length + 2;
      expect(adapter.replaceText).to.have.been.calledWith(':' + toStringMockResult + '#', size, size);
    });
  });
});
