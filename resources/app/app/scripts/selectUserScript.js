const fs = require("fs");
const path = require("path");
const { ipcRenderer } = require("electron");

let userName;
let user;

fs.readdir(path.join(__dirname, `userData`), (error, files) => {
  files.forEach((file) => {
    let userName = file.slice(0, file.length - 4);
    let option = document.createElement("option");
    option.value = userName;
    option.innerHTML = userName;
    document.getElementById("inputGroupSelect").appendChild(option);
  });
});

document
  .getElementById("userSelectButton")
  .addEventListener("click", selectUser);

function selectUser() {
  if (document.getElementById("inputGroupSelect").value !== "") {
    userName = document.getElementById("inputGroupSelect").value;

    let userData = fs.readFileSync(
      path.join(__dirname, `userData/${userName}.txt`)
    );
    user = JSON.parse(userData);

    ipcRenderer.send("userSelect", user);
  }
}
