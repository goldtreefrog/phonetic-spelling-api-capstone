"use strict";

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
  if (zoomPercent > 201 || zoomPercent < 50) {
    zoomPercent = 100;
  }
  $("body").css("zoom", `${zoomPercent}%`);
  return zoomPercent;
}

// Function: sendToLanguageToolAPI
function sendToLanguageToolAPI(textToCheck) {
  // Find misspellings with LanguageTool
  var params = {
    site: "",
    text: textToCheck,
    language: "en-us"
  };

  let url = "https://languagetool.org/api/v2/check";

  $.getJSON(url, params, parseLTResults);
}

function parseLTResults(data) {
  const misspellings = [];

  $.each(data.matches, function(dataKey, dataValue) {
    // console.log("dataValue, dataKey");
    // console.log(dataValue, dataKey);
    let offs = dataValue.offset;
    // console.log("offset");
    // console.log(dataValue.offset);
    let len = dataValue.length;
    // console.log("length");
    // console.log(dataValue.length);
    // console.log(dataValue.shortMessage);
    let sent = dataValue.sentence;
    // console.log(dataValue.sentence);
    var res = sent.substring(offs, len + offs);
    // console.log(res);

    // Push misspelled word and its offset into the misspellings array
    if (dataValue.shortMessage === "Spelling mistake") {
      misspellings.push({ mWord: res, offset: offs });
    }
  });
  // Search for alternatives to phonetic misspelling
  if (misspellings.length > 0) {
    offerSpellings(misspellings, 0);
  }
}

function offerSpellings(misspellings, curRow) {
  $("button#correct").val([misspellings[curRow].offset, curRow]);
  getSpellingFromAPI(misspellings[curRow].mWord);
}

// Function: getSpellingFromAPI
// Check spelling of word. If incorrect, return suggestions
function getSpellingFromAPI(wordToCheck) {
  console.log("2. In getSpellingFromAPI");
  console.log("wordToCheck: ", wordToCheck);
  let url = "https://api.datamuse.com/words";

  var params = {
    site: "", // Keeps browsers happy, though API doesn't require it.
    max: 20, // Default is 100.
    sl: wordToCheck
  };

  $.getJSON(url, params, suggestSpelling); // FIX THIS add callback
}

// Function: suggestSpelling
// Display suggested spellings for misspelled word
function suggestSpelling(data) {
  console.log("3. In suggestSpelling");
  console.log(data);
  // if // Here we want to check counter for displayed words by looking at value of More button.
  // $("#spelling-choices").prepend("<li>" + data[0].word + "</li>")
}

function sayIt(textToSay, focusElem) {
  responsiveVoice.speak(textToSay);
  if (focusElem) {
    $(focusElem).focus();
  }
}

// Step 2: Using global variables, functions and objects (document ready and triggers)

// document ready; listen for triggers
$(document).ready(function() {
  // Zoom in
  $("#plus").on("click", function(e) {
    e.preventDefault();
    let step = 10;
    zoomPercent = zoomPage(zoomPercent, step);
  });

  // Zoom out
  $("#minus").on("click", function(e) {
    e.preventDefault();
    let step = -10;
    zoomPercent = zoomPage(zoomPercent, step);
  });

  // Read text aloud using Responsive Voice API

  $("#read-aloud").on("click", function(e) {
    e.preventDefault();
    let textToSpeak = $.trim($("textarea").val());

    if (!textToSpeak) {
      sayIt(
        "Type in the big box and click the Read Aloud button again.",
        "textarea"
      );
      // return;
    } else {
      sayIt(textToSpeak);
      // responsiveVoice.speak(textToSpeak);
    }
  });

  // Identify misspelling using LanguageTool API
  $("#misspellings").on("click", function(e) {
    e.preventDefault();
    console.log("1. Check Spelling clicked");

    // See if there is any text at all.
    let textToSpell = $.trim($("textarea").val());

    if (!textToSpell) {
      sayIt(
        "Type in the big box and click the Check Spell ing button again.",
        "textarea"
      );
      return;
    }

    sendToLanguageToolAPI(textToSpell);
  });

  // Delete text in textarea
  $("#clear").on("click", function(e) {
    e.preventDefault();

    if (!$("textarea").val()) {
      sayIt("The big box is already empty.", "textarea");
      return;
    }

    let userMsg = "Click OK to delete your text or Cancel to keep it there.";

    var parameters = {
      onstart: voiceStartCallback
      // onend: voiceStartCallback(userMsg) // Does not work
    };

    responsiveVoice.speak(userMsg, "US English Male", parameters);

    // For some as-yet unknown reason, if you pass userMsg to the voiceStartCallBack function, the confirm dialog popsup and the Responsive Voice message is not spoken UNTIL AFTER the dialog box is closed. Inside the RV function, you do not have to pass the message and everything works as desired.
    function voiceStartCallback() {
      console.log("Voice start");
      if (confirm(userMsg)) {
        $("textarea").val("");
      }
    }

    $("textarea").focus();
  });
});
