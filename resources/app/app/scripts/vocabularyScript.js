const path = require("path");
const fs = require("fs");
const { ipcRenderer } = require("electron");
import { openPage } from "./modules/openPage.js";

document.getElementById("mainMenu").addEventListener("click", openPage);
document.getElementById("addNewWordsPage").addEventListener("click", openPage);

let user;

ipcRenderer.send("getUser");
ipcRenderer.on("recieveUser", (e, username) => {
  user = username;
  createTable();
  document.getElementById(
    "title"
  ).innerHTML = `Language Flash Cards - ${user.name}`;
});

const table = document.getElementById("table");

function createTable() {
  for (var i = 0; i < user.words.length; i++) {
    let tr = document.createElement("tr");

    let th = document.createElement("th");
    th.scope = "row";
    th.innerHTML = i + 1;
    th.ondblclick = editWord;
    th.oncontextmenu = deleteWord;

    let td1 = document.createElement("td");
    td1.innerHTML = user.words[i].foreign;
    td1.ondblclick = editWord;
    td1.oncontextmenu = deleteWord;

    let td2 = document.createElement("td");
    td2.innerHTML = user.words[i].native;
    td2.ondblclick = editWord;
    td2.oncontextmenu = deleteWord;

    let td3 = document.createElement("td");
    td3.ondblclick = editWord;
    td3.oncontextmenu = deleteWord;
    user.words[i].tags.forEach((tag) => {
      td3.innerHTML += tag + " ";
    });

    tr.appendChild(th);
    tr.appendChild(td1);
    tr.appendChild(td2);
    tr.appendChild(td3);
    table.appendChild(tr);
  }
}

function editWord(e) {
  let parentNode = e.target.parentNode;
  let child = parentNode.childNodes[0];
  let wordToEdit = child.innerHTML - 1;

  ipcRenderer.invoke("editWord", wordToEdit).then((wordToEdit) => {
    return;
  });
}

function deleteWord(e) {
  let parentNode = e.target.parentNode;
  let child = parentNode.childNodes[0];
  let wordToDelete = child.innerHTML - 1;

  //Remove word from user array
  user.words.splice(wordToDelete, 1);

  // I have to clear Working Tags here otherwise there is a chance that you will delete all the words associated with that tag, but the flash card
  // page will assume you still want those words and will throw an error.
  user.workingTags = [];

  //Save file
  fs.writeFileSync(
    path.join(__dirname, `/userData/${user.name}.txt`),
    JSON.stringify(user),
    (err) => {
      console.log(err);
    }
  );

  //Update User
  ipcRenderer.send("updateUser", user);

  //Delete Table
  table.innerHTML = "";

  //Redraw table
  createTable();
}
