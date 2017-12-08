'use strict';

// Function: main
// Carries out initial tasks.
function main() {
  let zoomFactor = 1;
  handleClicks(zoomFactor);
}

// Function: handleClicks
// Click listeners: Respond to user clicks of buttons and links (other than straight HTML navigation).
function handleClicks (zFactor) {

  $('#plus').on('click', function(e) {
    e.preventDefault();
    let step = .1
    zFactor = zoomPage(zFactor, step);
  })

  $('#minus').on('click', function(e) {
    e.preventDefault();
    let step = -.1
    zFactor = zoomPage(zFactor, step);
  })

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

  $('#clear').on('click', function(e) {
    e.preventDefault();

    let userMsg = "Click OK to delete your text or Cancel to keep it there."

    var rVParameters = {
        onstart: voiceStartCallback,
        // onend: voiceEndCallback
    }
    function voiceStartCallback() {
        console.log("Voice started");
        if(confirm(userMsg)) {
          $('textarea').val('');
        }
    }

    responsiveVoice.speak(userMsg,"US English Male", rVParameters);

  });

}

// Function: zoomPage
// Zoom function
function zoomPage(zFactor, step) {
  // Maximum zoom in or out is double or half; when exceeded, return to default browser size.
  zFactor += step;
  if(zFactor > 2.1 || zFactor < .5) {
    zFactor = 1;
  }
  $('body').css('zoom', `${zFactor*100}%`)
  return zFactor;
}

$(main());
