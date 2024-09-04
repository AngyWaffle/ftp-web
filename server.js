const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('basic-ftp');
const multer = require('multer');

const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));

app.listen(3001, () => console.log("Server ready on port 3001."));

module.exports = app;

const upload = multer({ dest: 'uploads/' }); 

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for forms
app.use(express.static('public'));

var loginInfo = []

app.get('/api/sample-function', async (req, res) => {
    try {
        const result = await downloadFile();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/connect', async (req, res) => {
    loginInfo = []
    const { host, username, password, port } = req.body;
    const client = new Client();
    loginInfo.push(host, username, password, port)

    try {
        await client.access({
            host,
            user:username,
            password,
            port,
            secure: true
        });
        console.log(`Connected to ${host}`);

        // Listing files in the current directory
        await client.ensureDir("/")
        const fileList = await client.list();
        await client.close();
        //res.json({ files: fileList });
        res.render('fileListPage', { files: fileList });
    } catch (error) {
        console.error(`Connection failed: ${error.message}`);
        res.status(500).send(error.message);
    }
}); 

app.post('/navigate', async (req, res) => {
    const host = loginInfo[0]
    const username = loginInfo[1]
    const password = loginInfo[2]
    const port = loginInfo[3]
    //const { host, username, password, port } = req.body;
    const { path = '/' } = req.body;
    console.log('Navigating to path:', path);
    const client = new Client();

    try {
        await client.access({
            host,
            user:username,
            password,
            port,
            secure: true
        });
        await client.ensureDir("/");
        const fileList = await client.list(path);
        await client.close();
        res.json({ success: true, files: fileList }); // Return a JSON response
    } catch (error) {
        console.error(`Error navigating: ${error.message}`);
        res.json({ success: false, message: error.message }); // Send JSON error
    }
});

app.post('/upload', upload.array('files'), async (req, res) => {
    const files = req.files;
    const path = req.body.path; // The target directory path on the FTP server
    console.log(files)
    console.log(path)
    const host = loginInfo[0]
    const username = loginInfo[1]
    const password = loginInfo[2]
    const port = loginInfo[3]

    const client = new Client();

    try {
        await client.access({
            host,
            user:username,
            password,
            port,
            secure: true
        });
        for (const file of files) {
            await client.uploadFrom(file.path, `${path}/${file.originalname}`);
        }

        await client.close();
        res.json({ success: true });
    } catch (error) {
        console.error('Upload failed:', error);
        res.json({ success: false, message: error.message });
    }
});

/* app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); */
