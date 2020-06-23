const path = require("path");
const fs = require("fs");
const { ipcRenderer } = require("electron");
document.getElementById("submitGuess").addEventListener("click", submitAnswer);
const guess = document.getElementById("guess");
const correctChime = document.getElementById("correctChime");
const incorrectChime = document.getElementById("incorrectChime");

let user;
let card = document.getElementById("card");
let correctAnswer;
let validCards = [];

ipcRenderer.send("getUser");
ipcRenderer.on("recieveUser", (e, username) => {
  user = username;
  //Display appropriate language text for the user
  document.getElementById("title").innerHTML += ` - ${user.name}`;
  if (user.currentLanguage === "foreign") {
    document.getElementById(
      "mainText"
    ).innerHTML = `${user.nativeLanguage} to ${user.foreignLanguage}`;
  } else if (user.currentLanguage === "native") {
    document.getElementById(
      "mainText"
    ).innerHTML = `${user.foreignLanguage} to ${user.nativeLanguage}`;
  }

  //Filter words based on selected tags
  if (user.workingTags.includes("all") || user.workingTags.length === 0) {
    validCards = user.words;
  } else {
    for (var i = 0; i < user.workingTags.length; i++) {
      for (var j = 0; j < user.words.length; j++) {
        for (var k = 0; k < user.words[j].tags.length; k++) {
          if (user.words[j].tags[k] === user.workingTags[i]) {
            validCards.push(user.words[j]);
          }
        }
      }
    }
  }

  getRandomWord();
  guess.focus();
});

function getRandomWord() {
  let x = Math.floor(Math.random() * validCards.length);

  if (user.currentLanguage === "foreign") {
    card.innerHTML = validCards[x].native;
    correctAnswer = validCards[x].foreign;
  } else if (user.currentLanguage === "native") {
    card.innerHTML = validCards[x].foreign;
    correctAnswer = validCards[x].native;
  }
}

function submitAnswer() {
  user.totalAttempts++;

  //Correct submission
  if (guess.value === correctAnswer) {
    user.attemptsCorrect++;
    user.attemptCorrectPercent = Math.round(
      (user.attemptsCorrect / user.totalAttempts) * 100
    );
    correctChime.load();
    correctChime.play();
    guess.value = "";
    guess.focus();
    guess.classList.add("btn-outline-success");
    setTimeout(() => {
      guess.classList.remove("btn-outline-success");
    }, 1000);
    getRandomWord();
    fs.writeFileSync(
      path.join(__dirname, `userData/${user.name}.txt`),
      JSON.stringify(user),
      (err) => {
        console.log(err);
      }
    );
    ipcRenderer.send("updateUser", user);

    //Incorrect Submission
  } else {
    user.attemptCorrectPercent = Math.round(
      (user.attemptsCorrect / user.totalAttempts) * 100
    );
    incorrectChime.load();
    incorrectChime.play();
    guess.classList.add("btn-outline-danger");
    setTimeout(() => {
      guess.classList.remove("btn-outline-danger");
    }, 1000);
    fs.writeFileSync(
      path.join(__dirname, `userData/${user.name}.txt`),
      JSON.stringify(user),
      (err) => {
        console.log(err);
      }
    );
    ipcRenderer.send("updateUser", user);
  }
}

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    submitAnswer();
  }
});

document.getElementById("mainMenuButton").addEventListener("click", openPage);
document
  .getElementById("addNewWordsPageButton")
  .addEventListener("click", openPage);

import { openPage } from "./modules/openPage.js";
