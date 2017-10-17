/*! Levismad Spritzer v0.02.0 */
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

/**
* Function to remove trailing and white spaces in a string
* e.g: '0 1   2   '.trim() -> '012'
* @returns formatted string
*/
if (typeof String.prototype.trim !== "function") {
  String.prototype.trim = function() {
    if (typeof(obj) === "undefined" || obj == "") {
      return "";
    }
    return obj.replace(/^\s+|\s+$/g, '');
  }
}
/**
* Function to format a string given 'n' parameters into a string template
* e.g: '{0}...{1}...{2}'.format(1,2,3) -> '1...2...3'
* @returns current string without trailing and white spaces
*/
if (typeof String.prototype.format !== "function") {
  
  String.prototype.format = function () {
    var s = this;      
    for (var i = 0; i < arguments.length; i++) {
      var reg = new RegExp("\\{" + i + "\\}", "gm");
      s = s.replace(reg, arguments[i]);
    }      
    return s;
  };
}
/**
* Every word needs to wrapped in a <span> element in order to change it text color to indicate that it is current in use
* @param paragraph - word string separated by blank space
* @returns a string with the words wrapped in <span> elements
* e.g breakToWords("one two three") -> "<span id='p-0'>one</span><span id='p-1'>two</span><span id='p-2'>three</span>"
*/
var breakToWords = function(paragraph){
  return $.map(paragraph.split(" "),function(i,v){
    return "<span id='p-{0}'>{1}</span>".format(v,i);
  }).join('');
}

/**
* Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
* @param obj1
* @param obj2
* @returns obj3 a new object based on obj1 and obj2
*/
function _mergeObjects(obj1, obj2) {  
  var obj3 = {};
  if(typeof(obj1) === typeof({}) && typeof(obj2) === typeof({})){
    for (var attrname in obj1) {
      obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) {
      obj3[attrname] = obj2[attrname];
    }
  }
  return obj3;
}


var Spritzer = (function($) {  
  
  var publicAPI = {
    init: function(element , options) {
      this.element = element;
      this.paragraphs = [{paragraph: 0, word: 0, pword: -1}];      
      this.settings = _mergeObjects({
        playing : true,
        currentTimer : null,
        improveTimer : null,
        currentWord : 0,
        currentWordOfParagraph : -1,
        delay : 0,
        vrum : 100,
        wpm : 0,
        pauseCount : 0,
        wordsWithoutPause : 0,
        paragraphCount : 0,
        paragraphRead : 0
      }, options);
      
      this.construct(this.settings.text);
      this.attachEventHandlers();
      this.render(this.settings.text, this.settings.wpm);
    },
    construct: function(paragraphs) {
      $(this.element).addClass('spritzed').append("<div></div>");
      $("#current-paragraph").html(breakToWords(paragraphs[0]));
    },
    attachEventHandlers: function() {
      $(document).off("keyup");
      $(document).on("keyup", function(e){
        //left arrow key
        if(e.keyCode == 37){
          this.pause();
          this.backOneParagraph();
        }        
        //space bar key
        else if(e.keyCode == 32){
          this.toggle()
        }        
        //right arrow key
        else if(e.keyCode == 39){
          this.play()
        }
      }.bind(this));
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
    backOneParagraph: function(){
      if(!this.settings.playing){
        var item = 0;
        $.each(this.paragraphs, function(i,v){
          //Spritzer keeps the record of it pauses, so it can return to previously seen paragraph (-1)
          if(v.word == this.settings.currentWord) item = i - 1;
        }.bind(this));
        if(this.settings.paragraphRead > this.paragraphs[item].paragraph){
          //update big picture panel, if a new paragraph is reached
          $("#paragraphs").html("{0}/<b>{1}</b>".format(this.paragraphs[item].paragraph+1,this.settings.paragraphCount));
          $("#current-paragraph").html(breakToWords(this.settings.text[this.paragraphs[item].paragraph]));
        }
        this.settings.currentWordOfParagraph = this.paragraphs[item].pword;
        this.settings.currentWord = this.paragraphs[item].word;
        this.settings.paragraphRead = this.paragraphs[item].paragraph;
        
        //Forget about recently seen paragraph
        if(this.paragraphs.length > 1)
          this.paragraphs = this.paragraphs.splice(0,this.paragraphs.length - 1);
        
        //Starts read again
        if(!this.settings.playing){            
          this.play();
        }
      }
    },
    updatePauses: function(){
      var found = false;
      $.each(this.paragraphs, function(i,v){
        if(v.word == this.settings.currentWord && v.paragraph == this.settings.paragraphRead) found = true;
      }.bind(this));
      if(!found) this.paragraphs.push({paragraph: this.settings.paragraphRead, word: this.settings.currentWord, pword: this.settings.currentWordOfParagraph});
    },
    displayNextWord: function() {

      //Set the current word in the big picture panel
      $("#current-paragraph span").removeClass("focus");
      $("#current-paragraph span#p-{0}".format(++this.settings.currentWordOfParagraph)).addClass("focus");

      var word = this.settings.words[this.settings.currentWord++];
      while(word == '#<span class="highlight">#</span>#'){
        word = this.settings.words[this.settings.currentWord++];
        this.settings.paragraphRead++;
        this.settings.currentWordOfParagraph = 0;
        this.updatePauses();
        
        //update big picture panel, if a new paragraph is reached
        $("#paragraphs").html("{0}/<b>{1}</b>".format(this.settings.paragraphRead+1,this.settings.paragraphCount));
        $("#current-paragraph").html(breakToWords(this.settings.text[this.settings.paragraphRead]));
        
      }

      if (typeof word == 'undefined') return;
      
      this.settings.wordsWithoutPause++;
      var hasPause = /^\(|[,\.\);!\?]$/.test(word)
      if(hasPause &&  (this.settings.pauseCount >= 2 || this.settings.wordsWithoutPause >= 20) && this.settings.vrum >= this.settings.wpm) {
        this.updatePauses();        
        this.pause();
      }
      if(hasPause){
        this.settings.pauseCount++; 
      } 

      // Display current word in the spritzer panel
      this.element.firstElementChild.innerHTML = word
      this.positionWord()
      
      //Slowly increase the "words per minute" (wpm) until reach the selected value to wpm
      if(this.settings.vrum < this.settings.wpm) this.settings.vrum += (this.settings.wpm/10);
      this.settings.lay = 60000 / this.settings.vrum;
      
      //If not reach the end of the text, keeps playing
      if (this.settings.currentWord !== this.settings.words.length && this.settings.playing){
        this.settings.currentTimer = setTimeout(function() { this.displayNextWord() }.bind(this), this.settings.delay * (this.settings.hasPause ? 2 : 1))
      }
    },
    
    render: function(text, wpm_) {
      var stripe = text.join(' ### ');
      this.settings.words = stripe.split(/\s+/).map(this.processWord);
      this.settings.paragraphCount = (text || []).length;
      this.settings.delay = 60000 / 300
      this.settings.wpm = wpm_;
      
      $("#paragraphs").html("{0}/<b>{1}</b>".format(this.settings.paragraphRead+1,this.settings.paragraphCount));
      
      this.settings.playing = true;
      clearTimeout(this.settings.currentTimer);
      this.displayNextWord()
    },
    
    play: function() {      
      if(!this.settings.playing){
        this.settings.playing = true;
        this.displayNextWord();
      }
    },
    
    pause: function() {
      this.settings.playing = false;
      
      this.settings.vrum = 150;
      this.settings.pauseCount = 0;
      this.settings.wordsWithoutPause = 0;
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


