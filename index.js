const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

io.on("connection", (socket) => {
  socket.on("drawing", (data) => socket.broadcast.emit("drawing", data));
  socket.on("gridUpdate", (data) => {
    imageData[data.cell] = Number(data.color);
    //console.log(imageData);
    socket.broadcast.emit("gridUpdate", {"imageData":imageData});
  });
});

let length = 10 * 10;
let imageData = [];
let imageDataOld = [];
for (let i = 0; i < length; i++) {
  imageData[i] = 0;
}
imageDataOld = [...imageData];

//test more and more

const fs = require("fs");
const path = "imageData.csv";
if (fs.existsSync(path)) {
  //console.log("File exists");
  fs.readFile(path, "utf8", function (err, data) {
    if (err) throw err;
    let imageDataTemp = data.split(",");
    imageDataTemp.map((value, index) => {
      imageData[index] = value;
    });
    imageDataOld = [...imageData];
  });
} else {
  //console.log("File does not exist");
  fs.writeFile(path, imageData.join(","), function (err) {
    if (err) throw err;
    //console.log("File is created successfully.");
  });
}

//save file every 10 seconds only if it changed
setInterval(() => {
  //console.log("Checking if file is changed");
  //console.log(imageData);
  //console.log(imageDataOld);
  let isChanged = false;
  for (let i = 0; i < length; i++) {
    if (imageData[i] !== imageDataOld[i]) {
      isChanged = true;
      break;
    }
  }
  if (isChanged) {
    imageDataOld = [...imageData];
    fs.writeFile(path, imageData.join(","), function (err) {
      if (err) throw err;
      //console.log("File is updated successfully.");
    });
  }
}, 10000);

app.get('/imagedata', (req, res) => {
  res.send(imageData);
})

http.listen(port, () => console.log("listening on port " + port));