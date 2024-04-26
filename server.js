const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const fs = require('fs');
const fsPromises = require('fs').promises;
const PORT = process.env.PORT || 3500;

//Setting up for CORS
app.use(cors(corsOptions));

//Required to open and send json
app.use(express.json());

// Routes
app.use('/', require('./routes/root'));
app.use('/states', require('./routes/api/states'));

app.all('*', (req,res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({"error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));