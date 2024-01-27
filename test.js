import * as fs from "fs";

let URL;

URL = "https://www.linkedin.com/school/dtu-health-tech/posts/?feedView=all";
// URL = "https://www.linkedin.com/";
// URL = "https://www.linkedin.com/uas/login";
URL = "https://www.linkedin.com/checkpoint/lg/login-submit";
let resp = await fetch(URL, {
  // referrerPolicy: "unsafe-url",
  referrerPolicy: "strict-origin-when-cross-origin",
  headers: {},
  method: "POST",

  body: JSON.stringify({
    session_key: "ciuya@dtu.dk",
    session_password: "DigitalHealth",
  }),

  // headers: {
  //   "Access-Control-Allow-Headers": "Content-Type",
  //   "Access-Control-Allow-Origin": "*",
  //   "Content-Type": "application/json",
  //   "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PATCH",
  // },
});

// console.log(resp);
console.log(resp.status);

let data = await resp.text();

fs.writeFileSync("data.html", data);
// console.log(data);

resp = await fetch("https://www.linkedin.com/feed/", {});

console.log(resp.status);

data = await resp.text();

fs.writeFileSync("data2.html", data);
