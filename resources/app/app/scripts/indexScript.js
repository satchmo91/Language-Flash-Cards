const path = require("path");
const fs = require("fs");
const { ipcRenderer } = require("electron");
import { openPage } from "./modules/openPage.js";
let user;
let tagList = [];

document.getElementById("nativeToForeign").addEventListener("click", openPage);
document.getElementById("foreignToNative").addEventListener("click", openPage);
document.getElementById("addNewWordsPage").addEventListener("click", openPage);
const vocabularyButton = document.getElementById("vocabularyButton");
document.getElementById("vocabularyButton").addEventListener("click", openPage);

ipcRenderer.send("getUser");
ipcRenderer.on("recieveUser", (e, username) => {
  user = username;
  //Display appropriate information for the user
  document.getElementById("title").innerHTML += ` - ${user.name}`;
  document.getElementById(
    "nativeToForeign"
  ).innerHTML = `${user.nativeLanguage} to ${user.foreignLanguage}`;
  document.getElementById(
    "foreignToNative"
  ).innerHTML = `${user.foreignLanguage} to ${user.nativeLanguage}`;

  //Create a list of all tags the user has
  user.words.forEach((word) => {
    word.tags.forEach((tag) => {
      tagList.push(tag);
    });
  });

  //Filter out duplicate tags
  let uniqueTags = new Set(tagList);
  tagList = [...uniqueTags];

  //Create the tags on the screen
  for (var i = 0; i < tagList.length; i++) {
    createTags(tagList[i]);
  }

  //Update vocabulary counter
  vocabularyButton.innerHTML = `Words in vocabulary: ${user.words.length}`;
});

function createTags(name) {
  let tagName = name;
  let tagContainer = document.getElementById("tagContainer");

  let tagDiv = document.createElement("div");
  tagDiv.classList.add("form-check", "form-check-inline");

  let tagInput = document.createElement("input");
  tagInput.classList.add("form-check-input");
  tagInput.type = "checkbox";
  tagInput.id = tagName;
  tagInput.value = tagName;
  for (var i = 0; i < user.workingTags.length; i++) {
    if (user.workingTags[i] === tagName) {
      tagInput.checked = true;
    }
  }
  tagInput.addEventListener("change", (e) => {
    if (e.target.checked) {
      user.workingTags.push(e.target.id);
    } else if (!e.target.checked) {
      for (var i = 0; i < user.workingTags.length; i++) {
        if (user.workingTags[i] === e.target.id) {
          user.workingTags.splice(i, 1);
        }
      }
    }

    fs.writeFileSync(
      path.join(__dirname, `userData/${user.name}.txt`),
      JSON.stringify(user),
      (err) => {
        console.log(err);
      }
    );
    ipcRenderer.send("updateUser", user);
  });

  let tagLabel = document.createElement("label");
  tagLabel.classList.add("form-check-label");
  tagLabel.for = tagName;
  tagLabel.innerHTML = tagName;

  tagDiv.appendChild(tagInput);
  tagDiv.appendChild(tagLabel);
  tagContainer.appendChild(tagDiv);
}

//Handle "all" tag function which will toggle all tags when clicked
document.getElementById("all").addEventListener("click", () => {
  if (document.getElementById("all").checked) {
    Array.from(document.getElementsByClassName("form-check-input")).forEach(
      (tag) => {
        tag.checked = true;
        user.workingTags.push(tag.id);
      }
    );
  } else if (!document.getElementById("all").checked) {
    Array.from(document.getElementsByClassName("form-check-input")).forEach(
      (tag) => {
        tag.checked = false;
      }
    );
    user.workingTags = [];
  }

  let uniqueTags = new Set(user.workingTags);
  user.workingTags = [...uniqueTags];

  fs.writeFileSync(
    path.join(__dirname, `userData/${user.name}.txt`),
    JSON.stringify(user),
    (err) => {
      console.log(err);
    }
  );
  ipcRenderer.send("updateUser", user);
});
