const mongoose = require('mongoose');
const dns = require('dns');

// Force using Google DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);

const uri = "mongodb+srv://Karthik:Karthiksai9642@cluster0.dacf6.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
    .then(() => {
        console.log("Connected successfully to DB");
        process.exit(0);
    })
    .catch(err => {
        console.error("Connection failed", err.message);
        process.exit(1);
    });
