const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());


const getKioskData = () => {
    const rawData = fs.readFileSync('kiosks.json');  
    return JSON.parse(rawData);  
};


let currentVersion = `1.0.${Math.floor(Math.random() * 100)}`; 

app.get("/version", (req, res) => {
    res.json({ version: currentVersion });
});


app.get("/events", (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();


    const sendVersion = () => {
        res.write(`data: ${JSON.stringify({ version: currentVersion })}\n\n`);
    };

 
    sendVersion();

  
    const intervalId = setInterval(sendVersion, 1000); 

    req.on('close', () => {
        clearInterval(intervalId);  
    });
});


app.get("/kiosk", (req, res) => {
    const ipAddress = req.query.ip;
    console.log(`Cihaz IP Adresi: ${ipAddress}`);

    const kiosks = getKioskData();

    if (kiosks[ipAddress]) {
        let pageUrl = kiosks[ipAddress].page;
        
        const separator = pageUrl.includes("?") ? "&" : "?";
        pageUrl += `${separator}v=${currentVersion}`;

        res.json({ page: pageUrl });
    } else {
        res.status(404).json({ error: "Kiosk not found" });
    }
});

app.post("/update-version", (req, res) => {
    currentVersion = `1.0.${Math.floor(Math.random() * 100)}`; 
    console.log(`Yeni versiyon: ${currentVersion}`);
    res.json({ success: true, version: currentVersion });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
