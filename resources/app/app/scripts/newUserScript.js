const path = require("path");
const { ipcRenderer } = require("electron");
const fs = require("fs");

let user = {};

document.getElementById("newUserNameForm").focus();

document
  .getElementById("createUserButton")
  .addEventListener("click", createUser);

function capitalizeFLetter(x) {
  let y = x[0].toUpperCase() + x.slice(1);
  return y;
}

function createUser() {
  let name = document.getElementById("newUserNameForm").value;
  let nativeLanguage = document.getElementById("nativeLanguageForm").value;
  let foreignLanguage = document.getElementById("foreignLanguageForm").value;

  //check if fields are empty
  if (name === "" || nativeLanguage === "" || foreignLanguage === "") {
    document.getElementById("alert").classList.add("alert", "alert-danger");
    document.getElementById("alert").innerHTML = "Please fill in all fields";

    setTimeout(() => {
      document
        .getElementById("alert")
        .classList.remove("alert", "alert-danger");
      document.getElementById("alert").innerHTML = "";
    }, 2000);
  } else {
    //Capatilize First letters
    name = capitalizeFLetter(name);
    nativeLanguage = capitalizeFLetter(nativeLanguage);
    foreignLanguage = capitalizeFLetter(foreignLanguage);

    //define user
    user.name = name;
    user.nativeLanguage = nativeLanguage;
    user.foreignLanguage = foreignLanguage;
    user.workingTags = [];
    user.totalAttempts = 0;
    user.attemptsCorrect = 0;
    user.attemptCorrectPercent = 0;
    user.words = [];

    //create user data file
    fs.writeFileSync(
      path.join(__dirname, `/userData/${user.name}.txt`),
      JSON.stringify(user),
      (err) => {
        console.log(err);
      }
    );

    ipcRenderer.send("newUser", user);
  }
}
