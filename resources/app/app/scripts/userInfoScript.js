const { ipcRenderer } = require("electron");
let user;

ipcRenderer.send("getUserInfo");
ipcRenderer.on("recieveUser", (e, username) => {
  user = username;

  document.getElementById("header").innerHTML += " " + user.name;
  document.getElementById("nativeLanguage").innerHTML +=
    " " + user.nativeLanguage;
  document.getElementById("foreignLanguage").innerHTML +=
    " " + user.foreignLanguage;
  document.getElementById("totalAttempts").innerHTML +=
    " " + user.totalAttempts;
  document.getElementById("attemptsCorrect").innerHTML +=
    " " + user.attemptsCorrect;
  document.getElementById(
    "attemptCorrectPercent"
  ).innerHTML += ` ${user.attemptCorrectPercent}%`;
});
