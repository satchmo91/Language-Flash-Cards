const { ipcRenderer } = require("electron");

let user;

function openPage(page) {
  //get User
  ipcRenderer.send("checkUserWords");
  ipcRenderer.on("recieveUserWords", (e, username) => {
    user = username;

    //Check destination and language
    let destination = page.target.getAttribute("destination");
    let language = page.target.getAttribute("language");

    //check if user has words in list && is going to flash cards
    if (destination === "flashCards" && user.words.length > 0) {
      ipcRenderer.send("toNewPage", {
        destination: destination,
        language: language,
      });
    } else if (
      destination === "addNewWordsPage" ||
      destination === "index" ||
      destination === "vocabulary"
    ) {
      ipcRenderer.send("toNewPage", {
        destination: destination,
      });
    } else {
      let alertMessage = document.getElementById("submitAlert");
      alertMessage.classList.add("alert-danger");
      alertMessage.innerText = "Please Add Words to Continue";
      setTimeout(() => {
        alertMessage.innerText = "";
        alertMessage.classList.remove("alert-danger");
      }, 2000);
    }
  });
}

export { openPage };
