'use strict';

// Step 1: Defining global variables, functions and objects

let zoomFactor = 1;

function voiceStartCallback(userMsg) {
    console.log("Voice started");
    if(confirm(userMsg)) {
      $('textarea').val('');
    }
}

// Function: zoomPage
// Zoom function
function zoomPage(zoomFactor, step) {
  // Maximum zoom in or out is double or half; when exceeded, return to default browser size.
  zoomFactor += step;
  if(zoomFactor > 2.1 || zoomFactor < .5) {
    zoomFactor = 1;
  }
  $('body').css('zoom', `${zoomFactor*100}%`)
  return zoomFactor;
}


// Step 2: Using global variables, functions and objects (document ready and triggers)

// document ready goes
$(document).ready(function() {

// Zoom in
  $('#plus').on('click', function(e) {
    e.preventDefault();
    let step = .1
    zoomFactor = zoomPage(zoomFactor, step);
  })

// Zoom out
  $('#minus').on('click', function(e) {
    e.preventDefault();
    let step = -.1
    zoomFactor = zoomPage(zoomFactor, step);
  })

// Read text aloud
  $('#read-aloud').on('click', function(e) {
    e.preventDefault();
    let textToSpeak = $.trim($('textarea').val());
    // if (textToSpeak == false) {
    //   alert('You ninny!')
    // }
    if (!textToSpeak) {
      textToSpeak = "Type in the big box to the left and click this button again."
    }
    responsiveVoice.speak(textToSpeak);
  })

// Delete text in textarea
  $('#clear').on('click', function(e) {
    e.preventDefault();

    let userMsg = "Click OK to delete your text or Cancel to keep it there."

    var rVParameters = {
        onstart: voiceStartCallback(userMsg), 
        // onend: voiceEndCallback
    }

    responsiveVoice.speak(userMsg,"US English Male", rVParameters);

  });
});
