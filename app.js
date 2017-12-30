"use strict";

// Step 1: Defining global variables, functions and objects

// Function: zoomPage
// Zoom function
function zoomPage(step) {
  // Get the previous zoom level
  let zoomPercent = $("#plus").data("zoomLvl");

  // Maximum zoom in or out is double or half; when exceeded, return to default browser size.
  zoomPercent += step;
  if (zoomPercent > 201 || zoomPercent < 50) {
    zoomPercent = 100;
  }
  // Zoom it and store the new zoom level
  $("body").css("zoom", `${zoomPercent}%`);
  $("#plus").data("zoomLvl", zoomPercent);
}

// Function: sendToLanguageToolAPI
function sendToLanguageToolAPI(textToCheck) {
  // Find misspellings with LanguageTool
  const params = {
    site: "",
    text: textToCheck,
    language: "en-us"
  };

  let url = "https://languagetool.org/api/v2/check";
  $.getJSON(url, params, parseLTResults);
}

// Function: parseLTResults
function parseLTResults(data) {
  const misspellings = [];

  $.each(data.matches, function(dataKey, dataValue) {
    let offs = dataValue.offset;
    let len = dataValue.length;
    let res = $("textarea")
      .val()
      .substring(offs, len + offs);

    const repl = dataValue.replacements;

    // Push misspelled word and its offset into the misspellings array
    if (dataValue.shortMessage === "Spelling mistake") {
      misspellings.push({ mWord: res, offset: offs, replacements: repl });
    }
  });

  // Search for alternatives to misspelling and call function to display them
  if (misspellings.length > 0) {
    offerSpellings(0, misspellings);
  } else {
    // but if there are no misspellings, notify user
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
//    missWord: The misspelling created by the user
function offerSpellings(curRow, misspellings) {
  // If new data, store it in hidden input#suggestions field
  if (misspellings) {
    $("input#suggestions").val(JSON.stringify(misspellings)); //store array
    $("#more-words").val(""); // Clear previous
  } else {
    // otherwise, load previously-found data from where it was stored in hidden field.
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
    // There are (more) misspellings to go through, so show them
    $("#spelling-actions").css("display", "block");
  }

  // If there are no spelling suggestions for the current word, display and speak message, increment curRow () and get out.
  if (misspellings[curRow].replacements.length === 0) {
    let msgBegin = "We cannot find ";
    let msgEnd = " in our dictionary and have no suggestions. Click continue to skip to the next word.";
    let missWord = misspellings[curRow].mWord;

    $("#spelling-info").html(
      msgBegin +
        '<button class="spelling" id="user-spelling" name="user-spelling" type="submit" value="' +
        missWord +
        '">' +
        missWord +
        "</button>" +
        msgEnd
    );
    sayIt(msgBegin + missWord + msgEnd);

    // Change text on #more-words and hide #spelling-choices because they contain PREVIOUS misspelled word data.
    $("#more-words").css("visibility", "visible");
    $("#more-words").html('<u>C</u>ontinue <span class="fa fa-arrow-circle-right" aria-hidden="true">');
    $("#spelling-choices")
      .children()
      .remove();

    // Unless that was the FINAL misspelled word, increment row
    if (curRow < misspellings.length - 1) {
      curRow += 1;
      storeCurrentOffsetAndRow(misspellings[curRow].offset, curRow);
    } else {
      // Final row so cannot increment for array (or you get error) but still increment row so will get "finished" message next time.
      storeCurrentOffsetAndRow(misspellings[curRow].offset, curRow + 1);
    }

    return;
  }

  // Store the offest and current index on the Ignore button for later use.
  storeCurrentOffsetAndRow(misspellings[curRow].offset, curRow);

  // *******************************************************************************
  // Show suggested spellings, either from the beginning or from where you left off.
  // Check counter for displayed words by looking at value of More button.
  let firstSuggestion = 0; // Default to start at beginning
  let lastSuggestion = 4;

  // If #more-words is empty, we are starting with a new word to correct.
  if ($("#more-words").val() == "") {
    // Display spelling correction instructions and speak them also
    let missWord = misspellings[curRow].mWord;
    $("#spelling-info").html(
      'Instead of <button class="spelling" id="user-spelling" name="user-spelling" type="submit" value="' +
        missWord +
        '">' +
        missWord +
        "</button>" +
        ", did you mean any of these? Click the one you want:"
    );
    sayIt("Instead of " + missWord + ", did you mean any of these? Click the one you want.", "#user-spelling", "#write-box");
    // Otherwise, we are going to the next page of spelling suggestions
  } else {
    // If there is a value in #more-words, page forward to next group of suggestions.
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
    $("#more-words").html('<u>M</u>ore <span class="fa fa-arrow-circle-right" aria-hidden="true">');
  }
  // **** End of logic related directly to showing the spelling suggestions

  // If you are past the end of the data, set lastSuggestion to the end
  if (lastSuggestion > misspellings[curRow].replacements.length - 1) {
    lastSuggestion = misspellings[curRow].replacements.length - 1;
  }

  // Remove previous group of spelling suggestions
  $("#spelling-choices")
    .children()
    .remove();

  // Create the 5 suggestions in backwards order on the screen so they end up in forward order.
  for (let i = lastSuggestion; i >= firstSuggestion; i--) {
    $("#spelling-choices").prepend('<li><a class="spell-suggest" href="#">' + misspellings[curRow].replacements[i].value + "</a></li>");
  }

  // if you are at the end of the data, set #more-words to 0 and change the text of #more-words to "Start over." Also reset firstSuggestion.
  if (lastSuggestion === misspellings[curRow].replacements.length - 1) {
    $("#more-words").val(0);
    $("#more-words").text("Start Over");
    firstSuggestion = 0;
  } else {
    // Not at end, so add 1 to lastSuggestion and store it in #more-words for the next iteration
    $("#more-words").val(lastSuggestion + 1);
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

function textChangeByUser() {
  if (!($("textarea").val() === $("#check-spelling").val())) {
    // Tell the user to click Check Spelling again.
    // NOTE: For some reason, Responsive Voice pronouncess "spelling" as "speaking." The workaround is to break it like this: "spell ing" because it pronounces "spell" correctly.
    let msg = "The writing in the box above has changed. Please click Check ";
    $("#spelling-info").html(msg + "Spelling again.");
    sayIt(msg + "Spell ing again.");

    // Remove previous spelling suggestions
    $("#spelling-choices")
      .children()
      .remove();

    return true;
  } else {
    return false;
  }
}

function storeCurrentOffsetAndRow(curOffset, curRow) {
  $("button#ignore").val(JSON.stringify({ offset: curOffset, row: curRow }));
}

// Step 2: Using global variables, functions and objects (document ready and triggers)

// document ready; listen for triggers
$(document).ready(function() {
  // Set default zoom level if not present
  if (!$("#plus").data("zoomLvl")) {
    $("#plus").data("zoomLvl", 100);
  }
  // ***************************
  // Click events follow
  // ***************************

  // Zoom in
  $("#plus").on("click", function(e) {
    e.preventDefault();
    let step = 10;
    zoomPage(step);
  });

  // Zoom out
  $("#minus").on("click", function(e) {
    e.preventDefault();
    let step = -10;
    zoomPage(step);
  });

  // Read text aloud using Responsive Voice API
  $("#read-aloud").on("click", function(e) {
    e.preventDefault();
    let textToSpeak = $("textarea").val();
    // let textToSpeak = $.trim($("textarea").val());

    if (!textToSpeak) {
      sayIt("Type in the big box and click the Read Aloud button again.", "textarea");
      // return;
    } else {
      sayIt(textToSpeak);
      // responsiveVoice.speak(textToSpeak);
    }
  });

  // Identify misspelling using LanguageTool API
  $("#check-spelling").on("click", function(e) {
    e.preventDefault();

    // See if there is any text at all.
    let textToSpell = $("textarea").val();
    // let textToSpell = $.trim($("textarea").val());

    if (!textToSpell) {
      sayIt("Type in the big box and click the Check Spell ing button again.", "textarea");
      return;
    }

    // Store original textarea value so can tell if user changed it by typing directly.
    $("#check-spelling").val($("textarea").val());

    sendToLanguageToolAPI(textToSpell);
  });

  // Delete text in textarea - if the user confirms it
  $("#clear").on("click", function(e) {
    e.preventDefault();

    // If textarea is already empty, give an auditory message and do nothing else but get out.
    if (!$("textarea").val()) {
      sayIt("The big box is already empty.", "textarea");
      return;
    }

    let userMsg = "Click OK to delete your text or Cancel to keep it there.";

    // Callback function, voiceStartCallback, pops up confirmation dialog
    const parameters = {
      onstart: voiceStartCallback
      // onend: voiceStartCallback(userMsg) // Does not work
    };

    responsiveVoice.speak(userMsg, "US English Male", parameters);

    // For some as-yet unknown reason, if you pass userMsg to the voiceStartCallBack function, the confirm dialog popsup and the Responsive Voice message is not spoken UNTIL AFTER the dialog box is closed. Inside the RV function, you do not have to pass the message and everything works as desired.
    function voiceStartCallback() {
      if (confirm(userMsg)) {
        $("textarea").val("");
      }
    }

    $("textarea").focus();
  });

  // Click on More to display more spelling suggestions
  $("#more-words").on("click", function(e) {
    e.preventDefault();

    // Get out if direct typing change of textarea.
    if (textChangeByUser()) {
      return;
    }

    let positions = JSON.parse($("button#ignore").val());

    offerSpellings(positions.row);
  });

  // When mouse enters #more-words, set the focus there also to avoid confusion
  $("#more-words").on("mouseenter", function(e) {
    e.preventDefault;
    $(e.target).focus();
  });

  // If the mouse is already in #more-words and the user used keyboard to move out of it and then moves mouse, we want it to have the focus again (until the mouse moves out of the element).
  $("#more-words").on("mousemove", function(e) {
    if (!$(e.target).is(":focus")) {
      $(e.target).focus(); // Set the focus there also to avoid confusion
    }
  });

  // When #more-words has focus, reset colors on spelling suggestions and set colors on #more-words.
  $("#more-words").on("focus", function(e) {
    e.preventDefault;
    $("main#write #spelling-area #spelling-choices li a").css({
      "background-color": "white",
      color: "#006"
    });

    $("#more-words").css({ "background-color": "#423e24", color: "white" });
  });

  // When focus on spelling suggestion, speak that word
  $("#spelling-choices").on("focus", ".spell-suggest", function(e) {
    e.preventDefault;

    // Reset background color so if mouse is still over a different spelling suggestion, its background will be white. (For some reason, "none" does not work the same way.)
    $("main#write #spelling-area #spelling-choices li a").css({
      "background-color": "white",
      color: "#006"
    });
    // Reset background color on #more-words button in case mouse is still there.
    $("#more-words").css({ "background-color": "white", color: "#006" });
    // Set background color on the element with the focus
    $("main#write #spelling-area #spelling-choices li a:focus").css({
      "background-color": "#423e24",
      color: "white"
    });

    sayIt($(e.target).text());
  });

  // When hover on spelling suggestion, speak that word
  $("#spelling-choices").on("mouseenter", ".spell-suggest", function(e) {
    e.preventDefault;
    $(e.target).focus();
  });

  // Click on suggested spelling word to replace user's original spelling with correction.
  $("#spelling-choices").on("click", ".spell-suggest", function(e) {
    e.preventDefault();

    // If the user changed the textarea DIRECTLY in the textare, issue message and get out
    if (textChangeByUser()) {
      return;
    }

    let positions = JSON.parse($("button#ignore").val());
    let userText = $("textarea").val();
    let newWord = $(e.target).text();
    let lastChar = userText.length;

    let correctedText =
      userText.substring(0, positions.offset) + newWord + userText.substring(positions.offset + $("#user-spelling").text().length, lastChar);

    $("textarea").val(correctedText);

    // Readjust the offset for all SUBSEQUENT misspelled words so that the correct part of textarea will be replaced.
    let lengthDiff = newWord.length - $("#user-spelling").text().length;
    if (!(lengthDiff == 0)) {
      // Get the array of all misspelling suggestions for all the words with their offsets
      //  #suggestions holds JSON array of key/value pairs where each row contains :
      //    mWord:    mispelled word
      //    offset:   position of the misspelling in the original text
      //    replacements: array of spelling suggestions
      let aMisspellings = JSON.parse($("input#suggestions").val()); // retrieve array
      for (let i = positions.row + 1; i < aMisspellings.length; i++) {
        // Next and subsequent rows
        aMisspellings[i].offset += lengthDiff;
      }
      // Store the adjusted array
      $("input#suggestions").val(JSON.stringify(aMisspellings));
    }

    // Reset #more-words because you are done with the current one. (It will be set again for next word.)
    $("#more-words").val("");

    // Update copy of textarea to compare later
    $("#check-spelling").val($("textarea").val());

    // Suggest spelling for NEXT incorrect word, if any
    offerSpellings(positions.row + 1);
  });

  // If the user clicks on the copy of his original spelling, give additional instructions
  $("#spelling-info").on("click", "#user-spelling", function(e) {
    $("#spelling-info").html(
      'If you wish to ignore the word <button class="spelling" id="user-spelling" name="user-spelling" type="submit" value="' +
        $("#user-spelling").text() +
        '">' +
        $("#user-spelling").text() +
        "</button>" +
        "and go on to the next word, click the Ignore button below. Otherwise, click the spelling correction you want. You may also change the text in the writing box above and click the Check Spelling button again."
    );
    sayIt(
      "If you wish to ignore the word " +
        $("#user-spelling").text() +
        "and go on to the next word, click the Ignore button below. Otherwise, click the spelling correction you want. You may also change the text in the writing box above and click the Check Spell ing button again."
    );
  });

  // When the Ignore button is clicked, skip the current word and check the next one.
  $("#ignore").on("click", function(e) {
    e.preventDefault();

    // If the user changed the textarea DIRECTLY in the textare, issue message and get out
    if (textChangeByUser()) {
      return;
    }

    $("#more-words").val("");

    // Start with the NEXT misspelled word
    let positions = JSON.parse($("button#ignore").val());
    offerSpellings(positions.row + 1);
  });

  // Set focus when mouse enter to avoid confusion
  $("#ignore").on("mouseenter", function(e) {
    e.preventDefault;
    $(e.target).focus();
  });

  // When focus on #ignore, reset colors on #more-words
  $("#ignore").on("focus", function(e) {
    e.preventDefault;
    $("#more-words").css({
      "background-color": "white",
      color: "#006"
    });

    $("#ignore").css({
      background: "none",
      "background-color": "#423e24",
      color: "white"
    });
  });

  // When mouse leaves #ignore, reset its colors
  $("#ignore").on("mouseleave focusout", function(e) {
    $("#ignore").css({
      color: "black",
      background: "linear-gradient(#f5e882, #c7ba6b)"
    });
  });
});
