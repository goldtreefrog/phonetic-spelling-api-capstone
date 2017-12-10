'use strict';

// Step 1: Defining global variables, functions and objects

let zoomPercent = 100;

// function voiceStartCallback(userMsg) {
//     console.log("Voice ended? Hah!");
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


// Step 2: Using global variables, functions and objects (document ready and triggers)

// document ready goes
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
        // onend: voiceStartCallback(userMsg)
    }

    responsiveVoice.speak(userMsg,"US English Male", rVParameters);

    // For some as-yet unknown reason, if you pass userMsg to the voiceStartCallBack function, the confirm dialog popsup and the Responsive Voice message is not spoken UNTIL AFTER the dialog box is closed. Inside the RV function, you do not have to pass the message and everything works as desired.
    function voiceStartCallback() {
        console.log("Voice start");
        if(confirm(userMsg)) {
          $('textarea').val('');
        }
    }

  });
});
