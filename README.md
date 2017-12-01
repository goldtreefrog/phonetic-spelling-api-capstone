# Phonetic Spelling - Thinkful API Capstone Project
A responsive website that pulls data from three APIs, Datamuse (http://___), Responsive Voice  (https://responsivevoice.org/api/), and __(?) to encourage beginning spellers to write by helping with spelling and reading their writing back to them. Designed so that even one-fingered typists can use it.

## User Cases
This app is for users that fall into these categories, none of which are mutually exclusive:
1. As a beginning speller who often spells phonetically or inverts or leaves out letters, I want help correcting my spelling.
2. As a beginning reader, I want help reading back what I have written.
3. As a person with a speech challenge, I want help speaking to others in the same room.

### UI Flow
![UI Flow handwritten draft](https://github.com/KSherrell/where-is-the-iss-open-notify-api-capstone/blob/master/wireframe/ui-flow.jpg)
### Wireframe _main
![Wireframe _Main](https://github.com/KSherrell/where-is-the-iss-open-notify-api-capstone/blob/master/wireframe/wireframe-iss-main.jpg)
### Wireframe _User Cases
![Wireframe _User Case 1](https://github.com/KSherrell/where-is-the-iss-open-notify-api-capstone/blob/master/wireframe/wireframe-iss-user-cases.jpg)

## Working Prototype
You can access a working prototype of the app here: http://where-is-the-iss-open-notify-api-capstone.learn2code.club/

## Functionality
The app's functionality includes:
* An area for the user to input his/her text.
* A function to read the user's text aloud.
* A spell checker which offers possible correct spellings.
* The ability for the user to save chunks of text for the duration of the session (since no database is involved) and assign them to objects on the screen. Each such object will show the first few words of the text in that chunk.
* The ability for the user to append previously-saved chunks of text to the text writing/editing area so that such chunks can be strung together in new ways and the final result spoken aloud.

## Technology
* HTML
* CSS
* JavaScript
* jQuery

* The app uses AJAX JSON calls to the <a href="">Datamuse</a> API to check spellings and return suggestions for misspelled words.
* The app uses AJAX JSON calls to the <a href="http://www.convert-unix-time.com/api">Responsive Voice</a> Open Platform API to translate written text to speech and return voice output.
* The app uses AJAX JSON calls to the <a href=" (URL for dictionary if I add that)">dictionary (if I add that)</a>Open Platform API to return a definition for a word given as a suggested spelling.

## Responsive
App is built to be responsive across mobile, tablet, laptop, and desktop screen resolutions.

## Development Roadmap
This is v1.0 of the app, but future enhancements are expected to include:
* Use of a database and login capabilities so that users can store their writings.
