const { ipcRenderer } = require("electron");
const fs = require("fs");
import { openPage } from "./modules/openPage.js";

const alertMessage = document.getElementById("submitAlert");
const foreignWordInput = document.getElementById("foreignWordInput");
const nativeWordInput = document.getElementById("nativeWordInput");
const tagsInput = document.getElementById("tagsInput");
const vocabularyButton = document.getElementById("vocabularyButton");
const newWordChime = document.getElementById("newWordChime");
const incorrectChime = document.getElementById("incorrectChime");

document.getElementById("vocabularyButton").addEventListener("click", openPage);

let user;

ipcRenderer.send("getUser");
ipcRenderer.on("recieveUser", (e, username) => {
  user = username;
  document.getElementById("title").innerHTML += ` - ${user.name}`;
  vocabularyButton.innerHTML = `Words in vocabulary: ${user.words.length}`;
});

foreignWordInput.focus();

document.getElementById("homeButton").addEventListener("click", openPage);
document
  .getElementById("submitWordPairButton")
  .addEventListener("click", submitWordPair);

function submitWordPair() {
  if (foreignWordInput.value === "" || nativeWordInput.value === "") {
    alertMessage.classList.add("alert-danger");
    alertMessage.innerText = "Invalid Submission";
    incorrectChime.load();
    incorrectChime.play();
  } else if (checkForDuplicateWord(user.words, foreignWordInput.value)) {
    alertMessage.classList.add("alert-danger");
    alertMessage.innerText = "Invalid Submission, word already exists";
    incorrectChime.load();
    incorrectChime.play();
  } else {
    //Write New Words to File
    alertMessage.innerText = "Success!";
    alertMessage.classList.add("alert-success");
    newWordChime.load();
    newWordChime.play();

    let tags = [];

    var spans = document.getElementsByTagName("span");

    for (var i = 0, l = spans.length; i < l; i++) {
      tags.push(spans[i].innerHTML);
    }

    //Write File
    let newWordPair = {
      native: nativeWordInput.value,
      foreign: foreignWordInput.value,
      tags: tags.length > 0 ? tags : [],
    };

    user.words.push(newWordPair);

    fs.writeFileSync(
      __dirname + `/userData/${user.name}.txt`,
      JSON.stringify(user),
      (err) => {
        console.log(err);
      }
    );

    ipcRenderer.send("updateUser", user);

    //reset fields
    foreignWordInput.value = "";
    nativeWordInput.value = "";

    vocabularyButton.innerHTML = `Words in vocabulary: ${user.words.length}`;

    removeElementsByClass("tag");

    foreignWordInput.focus();
  }
  //Clear alert
  setTimeout(() => {
    alertMessage.innerText = "";
    alertMessage.classList.remove("alert-danger", "alert-success");
  }, 2000);
}

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    submitWordPair();
  }
});

function checkForDuplicateWord(words, checkWord) {
  for (var i = 0; i < words.length; i++) {
    if (words[i].foreign === checkWord) {
      return true;
    }
  }
}

function removeElementsByClass(className) {
  var elements = document.getElementsByClassName(className);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }
}

ipcRenderer.on("editWord", (e, { foreign, native }) => {
  foreignWordInput.value = foreign;
  nativeWordInput.value = native;
});
