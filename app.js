'use strict';

// Step 1: Defining global variables, functions and objects

let zoomPercent = 100;

// function voiceStartCallback(userMsg) {
//     console.log("Voice start");
//     if(confirm(userMsg)) {
//       $('textarea').val('');
//     }
// }

// Function: zoomPage
// Zoom function
function zoomPage(zoomPercent, step) {
  // Maximum zoom in or out is double or half; when exceeded, return to default browser size.
  zoomPercent += step;
  if(zoomPercent > 201 || zoomPercent < 50) {
    zoomPercent = 100;
  }
  $('body').css('zoom', `${zoomPercent}%`)
  return zoomPercent;
}

// Function: getSpellingFromAPI
// Check spelling of word. If incorrect, return suggestions
function getSpellingFromAPI (wordToCheck) {
  // Right now we send ALL words to Datamuse. We only want incorrect ones! *** FIX THIS ****
  console.log("2. In getSpellingFromAPI");
  let url = "https://api.datamuse.com/words?sl=spageti"

  var params = {
      site: ''     // Keeps browsers happy, though API doesn't require it.
      // max: 20,      // Default is 100.
      // sl: wordToCheck
  };

  $.getJSON(url, params, suggestSpelling)  // FIX THIS add callback
}

// Function: suggestSpelling
// Display suggested spellings for misspelled word
function suggestSpelling(data) {
  console.log("3. In suggestSpelling");
 //  console.log(data[0]);
 // $("#spelling-choices").prepend("<li>" + data[0].word + "</li>")
}

function sayIt(textToSay, focusElem) {
  responsiveVoice.speak(textToSay);
  if(focusElem) {
    $(focusElem).focus();
  }
}

// Step 2: Using global variables, functions and objects (document ready and triggers)

// document ready; listen for triggers
$(document).ready(function() {

// Zoom in
  $('#plus').on('click', function(e) {
    e.preventDefault();
    let step = 10
    zoomPercent = zoomPage(zoomPercent, step);
  })

// Zoom out
  $('#minus').on('click', function(e) {
    e.preventDefault();
    let step = -10
    zoomPercent = zoomPage(zoomPercent, step);
  })

// Read text aloud using Responsive Voice API

  $('#read-aloud').on('click', function(e) {
    e.preventDefault();
    let textToSpeak = $.trim($('textarea').val());

    if (!textToSpeak) {
      sayIt("Type in the big box and click the Read Aloud button again.", "textarea" )
      // return;
    } else {
      sayIt(textToSpeak)
      // responsiveVoice.speak(textToSpeak);
    }
  })

// Spell check using Datamuse API
  $('#misspellings').on('click', function(e) {
    e.preventDefault();
    console.log('1. Check Spelling clicked');

    let textToSpell = $.trim($('textarea').val());

    if (!textToSpell) {
      sayIt("Type in the big box and click the Check Spell ing button again.", "textarea")
      return;
    }

    // Make split on white space
    const userWords = textToSpell.split(/\s+/);
    userWords.forEach(function(uWord){
      // See if it is spelled correctly *** FIX THIS ***
      //
      // Check misspelling against sound-alike words
      getSpellingFromAPI(uWord);
    });
  });

// Delete text in textarea
  $('#clear').on('click', function(e) {
    e.preventDefault();

    if(!$('textarea').val()) {
      sayIt("The big box is already empty.", "textarea")
      return;
    }

    let userMsg = "Click OK to delete your text or Cancel to keep it there."

    var parameters = {
        onstart: voiceStartCallback
        // onend: voiceStartCallback(userMsg) // Does not work
    }

    responsiveVoice.speak(userMsg,"US English Male", parameters);

    // For some as-yet unknown reason, if you pass userMsg to the voiceStartCallBack function, the confirm dialog popsup and the Responsive Voice message is not spoken UNTIL AFTER the dialog box is closed. Inside the RV function, you do not have to pass the message and everything works as desired.
    function voiceStartCallback() {
        console.log("Voice start");
        if(confirm(userMsg)) {
          $('textarea').val('');
        }
    }

    $('textarea').focus();

  });
});
