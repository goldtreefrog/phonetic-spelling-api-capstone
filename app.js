"use strict";

// Step 1: Defining global variables, functions and objects

let zoomPercent = 100;
const spellData = [];
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
  } else {
    let msg = "Congratulations! All words appear to be spelled correctly";
    $("#spelling-info").html(msg);
    sayIt(msg);
    $("#spelling-choices")
      .children()
      .remove();
  }
}

function offerSpellings(misspellings, curRow) {
  console.log("in offerSpellings");
  console.log(misspellings[curRow].offset);
  // Store the offest on the Ignore button for later use.
  $("button#ignore").val(misspellings[curRow].offset);
  console.log($("button#ignore").val());
  getSpellingFromAPI(misspellings[curRow].mWord, misspellings[curRow].offset);
}

// Function: getSpellingFromAPI
// Check spelling of word. If incorrect, return suggestions
function getSpellingFromAPI(wordToCheck, offset) {
  $("#spelling-info").html(
    'Instead of <button class="spelling" id="user-spelling" name="user-spelling" type="submit" value="' +
      wordToCheck +
      '">' +
      wordToCheck +
      "</button>" +
      ", did you mean any of these? Click the one you want:"
  );

  sayIt(
    "Instead of " +
      wordToCheck +
      ", did you mean any of these? Click the one you want.",
    "#user-spelling",
    "#write-box"
  );

  console.log("2. In getSpellingFromAPI");
  console.log("wordToCheck: ", wordToCheck);
  let url = "https://api.datamuse.com/words";

  var params = {
    site: "", // Keeps browsers happy, though API doesn't require it.
    max: 40, // Default is 100.
    sl: wordToCheck
  };

  $.getJSON(url, params, suggestSpelling);
}

// Function: suggestSpelling
// Display suggested spellings for misspelled word
// Parameters:
//   data - array of suggested correct spellings containing word, score and numSyllables
// Variables:
//   firstSuggestion - index for data (above) for first word that will be displayed.
//   $("#more-words").val() contains the index that will be used to load the spelling suggestions from data (above). Once those suggestions are shown, $("#more-words").val() will be set to the index for the NEXT group of words, which will appear if the user clicks on "More ->".
function suggestSpelling(data) {
  console.log("3. In suggestSpelling");
  // console.log(offset);

  // Here we want to check counter for displayed words by looking at value of More button.
  let firstSuggestion = 0;
  let lastSuggestion = 4;

  // data will only have value if this function was the callback for the API, in which case replace the value in the global spellData. Otherwise we got here because the user clicked More, so use existing spellData, which was copied from the last time the API function ran.
  if (data) {
    // Clear contents of array
    spellData.length = 0;
    // Copy data's values into spellData
    $.each(data, function(row) {
      spellData.push(data[row]);
    });
  }

  console.log(spellData.length);
  console.log(spellData);

  // If there is a value in #more-words, use it.
  if (!$("#more-words").val() == "") {
    firstSuggestion = $("#more-words").val() * 1;
    lastSuggestion = firstSuggestion + 4;
  }

  // If firstSuggestion is 0, make sure #more-words no longer says "Start Over"
  if (firstSuggestion === 0) {
    $("#more-words").html(
      '<u>M</u>ore<span class="fa fa-arrow-circle-right" aria-hidden="true">'
    );
  }

  console.log(firstSuggestion, lastSuggestion);

  // If you are past the end of the data, set lastSuggestion to the end
  if (lastSuggestion > spellData.length - 1) {
    lastSuggestion = spellData.length - 1;
  }

  if (firstSuggestion < 0) {
    firstSuggestion = 0;
  }

  console.log(firstSuggestion, lastSuggestion);

  $("#spelling-choices")
    .children()
    .remove();

  for (let i = lastSuggestion; i >= firstSuggestion; i--) {
    $("#spelling-choices").prepend(
      '<li><a class="spell-suggest" href="#">' + spellData[i].word + "</a></li>"
    );
  }
  // if you are at the end of the data, set #more-words to 0 and change the text of #more-words to "Start over." Also reset firstSuggestion.
  if (lastSuggestion === spellData.length - 1) {
    $("#more-words").val(0);
    $("#more-words").text("Start Over");
    firstSuggestion = 0;
    console.log(
      firstSuggestion,
      lastSuggestion,
      $("#more-words").val(),
      $("#more-words").text()
    );
  } else {
    $("#more-words").val(lastSuggestion + 1);
  }
}

function sayIt(textToSay, focusElem, scrollElem) {
  responsiveVoice.speak(textToSay);
  if (focusElem) {
    $(focusElem).focus();
  }
  if (scrollElem) {
    $(window).scrollTo(scrollElem);
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

  // Click on More to display more spelling suggestions
  $("#more-words").on("click", function(e) {
    e.preventDefault();
    suggestSpelling();
  });

  // Click on Correct to replace user's original spelling with correction.
  $("#spelling-choices").on("click", ".spell-suggest", function(e) {
    e.preventDefault();
    console.log("Now we correct it!");
    let offset = $("#ignore").val();
    console.log("offset = " + offset);
    let userText = $("textarea").val();
    console.log($(e.target).text());
    let correctedText =
      userText.substring(0, offset) +
      $(e.target).text() +
      userText.substring(offset + $("#user-spelling").text().length, 9999);
    // let correctedText = userText.replace(
    //   $("button#user-spelling").text(),
    //   $(e.target).text()
    // );
    $("textarea").val(correctedText);
  });
});
