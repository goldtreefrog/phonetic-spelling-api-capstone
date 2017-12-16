"use strict";

// Step 1: Defining global variables, functions and objects

let zoomPercent = 100;
// const spellData = [];

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

// Function: parseLTResults
function parseLTResults(data) {
  console.log("In parseLTResults");
  const misspellings = [];

  $.each(data.matches, function(dataKey, dataValue) {
    console.log("dataValue, dataKey");
    console.log(dataValue, dataKey);
    let offs = dataValue.offset;
    console.log("offset");
    console.log(dataValue.offset);
    let len = dataValue.length;
    console.log("length");
    console.log(dataValue.length);
    // console.log(dataValue.shortMessage);
    // let sent = dataValue.sentence;  // Don't user sentence. Use context.
    // console.log(dataValue.sentence);
    // var res = sent.substring(offs, len + offs);
    console.log("context");
    console.log(dataValue.context);
    let cxt = dataValue.context.text;
    var res = cxt.substring(offs, len + offs);
    console.log(res);

    var repl = dataValue.replacements;
    // console.log(repl);
    // Push misspelled word and its offset into the misspellings array
    if (dataValue.shortMessage === "Spelling mistake") {
      misspellings.push({ mWord: res, offset: offs, replacements: repl });
    }
  });
  // Search for alternatives to phonetic misspelling
  if (misspellings.length > 0) {
    offerSpellings(0, misspellings);
  } else {
    let msg = "Congratulations! All words appear to be spelled correctly";
    $("#spelling-info").html(msg);
    sayIt(msg);
    $("#spelling-choices")
      .children()
      .remove();
  }
}

// Function: offerSpellings
// Parameters:
//  misspellings - array containing:
//    mWord:    mispelled word
//    offset:   position of the misspelling in the original text
//    replacements: array of spelling suggestions
// Variables:
//    firstSuggestion: index of first spelling suggestion that will be put in HTML
//    lastSuggestion:  index of last spelling suggestion that will be put in HTML
function offerSpellings(curRow, misspellings) {
  console.log("in offerSpellings with curRow = ");
  // console.log(curRow);
  // If new data, store it in hidden input#suggestions field
  if (misspellings) {
    console.log("creating new array");
    $("input#suggestions").val(JSON.stringify(misspellings)); //store array

    // // Display spelling correction instructions and speak them also
    // $("#spelling-info").html(
    //   'Instead of <button class="spelling" id="user-spelling" name="user-spelling" type="submit" value="' +
    //     misspellings[curRow].mWord +
    //     '">' +
    //     misspellings[curRow].mWord +
    //     "</button>" +
    //     ", did you mean any of these? Click the one you want:"
    // );
    // sayIt(
    //   "Instead of " +
    //     misspellings[curRow].mWord +
    //     ", did you mean any of these? Click the one you want.",
    //   "#user-spelling",
    //   "#write-box"
    // );

    // Otherwise, retrieve it from hidden input#suggestions field
  } else {
    console.log("Retrieving misspellings array");
    misspellings = JSON.parse($("input#suggestions").val()); //retrieve array
  }

  // Show spelling area
  $("#spelling-area").css("display", "block");

  // If there are no more misspellings, issue a message and exit this function
  if (curRow >= misspellings.length) {
    $("#spelling-info").html("Finished correcting spelling");
    sayIt("Finished correcting spelling");
    // Hide what should be hidden
    $("#spelling-actions").css("display", "none");
    return;
  } else {
    // console.log("Let us put the spelling actions back now!");
    $("#spelling-actions").css("display", "block");
  }

  // Store the offest and current index on the Ignore button for later use.
  // console.log("misspellings.length (nbr of misspelled words)");
  // console.log(misspellings.length);
  // console.log("curRow");
  // console.log(curRow);
  console.log("textarea offset");
  console.log(misspellings[curRow].offset);
  $("button#ignore").val(
    JSON.stringify({ offset: misspellings[curRow].offset, row: curRow })
  );
  console.log("buttons#ignore value =");
  console.log($("button#ignore").val());

  // Show the suggested spelling words
  // 1. Display the message and speak it also [moved above so only does it once]
  // $("#spelling-info").html(
  //   'Instead of <button class="spelling" id="user-spelling" name="user-spelling" type="submit" value="' +
  //     misspellings[curRow].mWord +
  //     '">' +
  //     misspellings[curRow].mWord +
  //     "</button>" +
  //     ", did you mean any of these? Click the one you want:"
  // );
  // sayIt(
  //   "Instead of " +
  //     misspellings[curRow].mWord +
  //     ", did you mean any of these? Click the one you want.",
  //   "#user-spelling",
  //   "#write-box"
  // );

  // 2. Show suggested spellings, either from the beginning or from where you left off.
  console.log("3. In offerSpellings about to suggest spellings");
  console.log(misspellings[curRow].replacements);

  // Check counter for displayed words by looking at value of More button.
  let firstSuggestion = 0; // Default to start at beginning
  let lastSuggestion = 4;

  // If #more-words is empty, we are starting with a new word to correct.
  if ($("#more-words").val() == "") {
    console.log("First set of words");
    // Display spelling correction instructions and speak them also
    $("#spelling-info").html(
      'Instead of <button class="spelling" id="user-spelling" name="user-spelling" type="submit" value="' +
        misspellings[curRow].mWord +
        '">' +
        misspellings[curRow].mWord +
        "</button>" +
        ", did you mean any of these? Click the one you want:"
    );
    sayIt(
      "Instead of " +
        misspellings[curRow].mWord +
        ", did you mean any of these? Click the one you want.",
      "#user-spelling",
      "#write-box"
    );
  } else {
    // If there is a value in #more-words, page forward to next group of suggestions.
    console.log("Folks we will display the next batch of suggestions!");
    firstSuggestion = $("#more-words").val() * 1;
    lastSuggestion = firstSuggestion + 4;
  }

  // If only 5 or fewer suggestions, hide #more-words
  if (misspellings[curRow].replacements.length <= 5) {
    $("#more-words").css("visibility", "hidden");
  } else {
    $("#more-words").css("visibility", "visible");
  }
  // If firstSuggestion is 0, make sure #more-words no longer says "Start Over"
  if (firstSuggestion === 0) {
    $("#more-words").html(
      '<u>M</u>ore <span class="fa fa-arrow-circle-right" aria-hidden="true">'
    );
  }

  // If you are past the end of the data, set lastSuggestion to the end
  if (lastSuggestion > misspellings[curRow].replacements.length - 1) {
    lastSuggestion = misspellings[curRow].replacements.length - 1;
  }

  // Can this ever happen? *** CHECK THIS ***
  if (firstSuggestion < 0) {
    firstSuggestion = 0;
  }

  // Remove previous group of spelling suggestions
  $("#spelling-choices")
    .children()
    .remove();

  // Create the 5 suggestions in backwards order on the screen so they end up in forward order.
  console.log("About to insert spelling suggestions:");
  // console.log("lastSuggestion = " + lastSuggestion);
  // console.log("firstSuggestion = " + firstSuggestion);
  for (let i = lastSuggestion; i >= firstSuggestion; i--) {
    // console.log(misspellings[curRow].replacements[i].value);
    $("#spelling-choices").prepend(
      '<li><a class="spell-suggest" href="#">' +
        misspellings[curRow].replacements[i].value +
        "</a></li>"
    );
  }
  // if you are at the end of the data, set #more-words to 0 and change the text of #more-words to "Start over." Also reset firstSuggestion.
  if (lastSuggestion === misspellings[curRow].replacements.length - 1) {
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
    console.log("Set #more-words to" + $("#more-words").val());
    console.log("lastSuggestion: " + lastSuggestion);
    console.log(
      "misspellings[curRow].replacements.length: " +
        misspellings[curRow].replacements.length
    );
  }
}

// Function: sayIt
// Speak text string with optional focus and scrolling
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
  $("#check-spelling").on("click", function(e) {
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
    console.log("about to retrieve value on button#ignore");
    let positions = JSON.parse($("button#ignore").val());
    console.log("positions = ");
    console.log(positions);

    offerSpellings(positions.row);
    $("#spelling-choices a:first").focus();
  });

  // Click on suggested spelling word to replace user's original spelling with correction.
  $("#spelling-choices").on("click", ".spell-suggest", function(e) {
    e.preventDefault();
    console.log("Now we correct it!");
    let positions = JSON.parse($("button#ignore").val());
    console.log(positions); // row, offset
    let userText = $("textarea").val();
    console.log($(e.target).text());
    let newWord = $(e.target).text();
    console.log("userText.length = " + userText.length);
    let lastChar = userText.length;
    // +
    // (newWord.length - $("#user-spelling").text().length);
    console.log("lastChar = " + lastChar);

    let correctedText =
      userText.substring(0, positions.offset) +
      newWord +
      // userText.substring(offset + newWord.length, lastChar);
      userText.substring(
        positions.offset + $("#user-spelling").text().length,
        lastChar
      );

    console.log(correctedText);
    $("textarea").val(correctedText);

    // Readjust the offset for all SUBSEQUENT misspelled words so that the correct part of textarea will be replaced.
    let lengthDiff = newWord.length - $("#user-spelling").text().length;
    console.log(newWord, $("#user-spelling").text());
    console.log("lengthDiff: " + lengthDiff);
    if (!(lengthDiff == 0)) {
      // Get the array of all misspelling suggestions for all the words with their offsets
      //  #suggestions holds JSON array of key/value pairs where each row contains :
      //    mWord:    mispelled word
      //    offset:   position of the misspelling in the original text
      //    replacements: array of spelling suggestions
      console.log("inside the if about lengthDiff");
      console.log(positions.row, positions.offset);
      let aMisspellings = JSON.parse($("input#suggestions").val()); // retrieve array
      console.log(aMisspellings);
      for (let i = positions.row + 1; i < aMisspellings.length; i++) {
        // Next and subsequent rows
        console.log("Original offset: " + aMisspellings[i].offset);
        // aMisspellings[i].offset = aMisspellings.offset * 1;
        aMisspellings[i].offset += lengthDiff;
        console.log("Adjusted offset: " + aMisspellings[i].offset);
      }
      // Store the adjusted array
      $("input#suggestions").val(JSON.stringify(aMisspellings));
    }
    //     positions.row
    // misspelled[curRow].offset);

    // Reset #more-words because you are done with the current one. (It will be set again for next word.)
    $("#more-words").val("");

    // Suggest spelling for NEXT incorrect word, if any
    offerSpellings(positions.row + 1);
  });
  $("#spelling-info").on("click", "#user-spelling", function(e) {
    console.log("Oh my! Clicked the incorrect one.");
    $("#spelling-info").html(
      'If you wish to ignore the word <button class="spelling" id="user-spelling" name="user-spelling" type="submit" value="' +
        $("#user-spelling").text() +
        '">' +
        $("#user-spelling").text() +
        " </button>" +
        "and go on to the next word, click the Ignore button below. Otherwise, click the spelling correction you want. You may also change the text in the writing box above and click the Check Spelling button again."
    );
    sayIt(
      "If you wish to ignore the word " +
        $("#user-spelling").text() +
        "and go on to the next word, click the Ignore button below. Otherwise, click the spelling correction you want. You may also change the text in the writing box above and click the Check Spell ing button again."
    );
  });
});
