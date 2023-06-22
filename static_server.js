import { createServer } from 'http';
import { readFile } from 'fs';
import { extname } from 'path';
import { argv } from 'process';

var contentTypes = {
    ".css": "text/css",
    ".gif": "image/gif",
    ".html": "text/html",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".swf": "application/x-shockwave-flash",
    ".tiff": "image/tiff",
    ".txt": "text/plain",
    ".wav": "audio/x-wav",
    ".wma": "audio/x-ms-wma",
    ".wmv": "video/x-ms-wmv",
    ".xml": "text/xml",
    '.cdf': 'application/vnd.wolfram.cdf.text'
};
var serveur = createServer(function (req, res) {
    //type: text/plain  et  text/html
    var url = req.url.slice(1).split("?")[0];
    if (url == "") url = "index.html";
    if (url.charAt(url.length - 1) == "/") url += "index.html";
    readFile("" + url, function readData(err, data) {
        if (!err) {
            res.writeHead(200, { 'Content-Type': contentTypes[extname(url)] || "text/plain" });
            res.end(data);
            console.log(req.url);
        } else {
            res.writeHead(200, { 'Content-Type': "text/html" });
            res.end("<h1>四零四</h1><h3>Fionlufion</h3>" + err);
        }
    });
});
const port = argv[2] ?? '8087';
serveur.listen(port, function () {
    console.log(`server start on port ${port}`);
})
