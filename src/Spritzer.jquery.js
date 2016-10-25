/*! Levismad Spritzer v0.01.0 */
/*
 * @requires jQuery v1.2.6+
 *
 * Copyright (c) 2016 Levi Esteves
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.levismad.com 
 *
 * @type jQuery
 * @name Spritzer
 * @author Levi Esteves - levi.esteves@gmail.com
 */
'use strict';
var Spritzer = (function($) {

    

  if (typeof String.prototype.trim !== "function") {
    String.prototype.trim = function() {
      if (typeof(obj) === "undefined" || obj == "") {
        return "";
      }
      return obj.replace(/^\s+|\s+$/g, '');
    }
  }

  /**
   * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
   * @param obj1
   * @param obj2
   * @returns obj3 a new object based on obj1 and obj2
   */
  function _mergeObjects(obj1, obj2) {
    var obj3 = {};
    for (var attrname in obj1) {
      obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
      obj3[attrname] = obj2[attrname];
    }
    return obj3;
  }
  
  var publicAPI = {
    /* TODO: code refactor */
    init: function(element , options) {
      if (typeof(options) !== typeof({})) {       
        options = {};
      } 
      this.element = element;
      this.paragraphs = [{paragraph: 0, word: 0}];
      this.settings = _mergeObjects({
        playing : true,
        currentTimer : null,
        improveTimer : null,
        currentWord : 0,
        delay : 0,
        vrum : 100,
        wpm : 0,
        pauseCount : 0,
        wordsWithoutPause : 0,
        paragraphCount : 0,
        paragraphRead : 0
      }, options);

      this.construct();
      this.attachEventHandlers();
      this.render(this.settings.text, this.settings.wpm);
    },
    attachEventHandlers: function() {
      $(document).off("keyup");
      $(document).on("keyup", function(e){
        if(e.keyCode == 37){
          this.backOneParagraph();
        }
        else if(e.keyCode == 32){
            this.toggle()
        }
        else if(e.keyCode == 39){
            this.play()
        }
      }.bind(this));
    },
    construct: function() {
      $(this.element).addClass('spritzed');
      $(this.element).append("<div></div>");      
    },
    render: function(text, wpm){
      render(text,wpm).bind(this);
    },
    positionWord: function() {
        var wordEl = this.element.firstElementChild,
            highlight = wordEl.firstElementChild
        
        var centerOffsetX = (highlight.offsetWidth / 2) + highlight.offsetLeft,
            centerOffsetY = (highlight.offsetHeight / 2) + highlight.offsetTop
        
        wordEl.style.left = ((this.element.clientWidth / 2) - centerOffsetX) + 'px'
        // wordEl.style.top = ((this.element.clientHeight / 2) - centerOffsetY) + 'px'
    },
    processWord: function(word) {
        var center = Math.floor(word.length / 2);
        var letters = word.split('');
        return letters.map(function(letter, idx) {
            if (idx === center)
                return '<span class="highlight">' + letter + '</span>'
            return letter;
        }).join('')
    },
    displayCounter: function() {

    },
    backOneParagraph: function(){
        if(!this.settings.playing){
          this.settings.currentWord = this.paragraphs[this.paragraphs.length - 2].word;
          this.settings.paragraphRead = this.paragraphs[this.paragraphs.length - 2].paragraph;
          this.paragraphs = this.paragraphs.splice(0,this.paragraphs.length - 1);
          console.log(this.settings.currentWord,this.paragraphs);
          if(!this.settings.playing){            
            this.play();
          }
        }
    },
    displayNextWord: function() {
        var word = this.settings.words[this.settings.currentWord++];
        while(word == '#<span class="highlight">#</span>#'){
            word = this.settings.words[this.settings.currentWord++];
            this.settings.paragraphRead++;
            console.log(this.settings.paragraphRead,this.settings.paragraphCount);
            document.querySelector("#paragraphs").innerHTML = this.settings.paragraphRead + "/" + this.settings.paragraphCount;
        }
        
            this.settings.wordsWithoutPause++;
            if (typeof word == 'undefined') return
            var hasPause = /^\(|[,\.\);!\?]$/.test(word)
            if(hasPause &&  (this.settings.pauseCount >= 2 || this.settings.wordsWithoutPause >= 20) && this.settings.vrum >= this.settings.wpm) {
                this.paragraphs.push({paragraph: this.settings.paragraphRead, word: this.settings.currentWord});
                this.settings.vrum = 150;
                this.settings.pauseCount = 0;
                this.settings.wordsWithoutPause = 0;
                this.pause();
            }
            if(hasPause){
                this.settings.pauseCount++; 
                // this.pause();
            } 
                
            this.element.firstElementChild.innerHTML = word
            this.positionWord()


            if(this.settings.vrum < this.settings.wpm) this.settings.vrum += (this.settings.wpm/25);
                this.settings.lay = 60000 / this.settings.vrum;

        if (this.settings.currentWord !== this.settings.words.length && this.settings.playing)
            this.settings.currentTimer = setTimeout(function() { this.displayNextWord() }.bind(this), this.settings.delay * (this.settings.hasPause ? 2 : 1))
    },

    render: function(text, wpm_) {
        var stripe = text.replace(/^\s+|\s+$/,'');
        stripe = stripe.replace(/\n/g,' ### ');
        this.settings.words = stripe.split(/\s+/).map(this.processWord)
        this.settings.paragraphCount = (text.match(/\n/g) || []).length;
        this.settings.delay = 60000 / 300
        this.settings.wpm = wpm_

        document.querySelector("#paragraphs").innerHTML = this.settings.paragraphRead + "/" + this.settings.paragraphCount;

        this.settings.playing = true
        clearTimeout(this.settings.currentTimer)
        this.displayNextWord()
    },

    play: function() {
        this.settings.playing = true
        this.displayNextWord()
    },

    pause: function() {
        this.settings.playing = false
        clearTimeout(this.settings.currentTimer)
    },

    toggle: function() {
        if (this.settings.playing){
            this.pause()
        }
        else{

            this.play()
          }
    }
  };

  return publicAPI;
})(jQuery);


$.fn.Spritzer = function(settings) {
  return this.each(function(i, element) {
    $(element).data("Spritzer", Object.create(Spritzer));
    $(element).data("Spritzer").init(element, settings);
  });
};

$(document).ready(function() {
  $("document").Spritzer({
    elementId: "document"
  });
});