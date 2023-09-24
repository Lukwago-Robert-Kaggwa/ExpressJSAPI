import express from 'express';
import multer from 'multer';
import path from 'path'
import cors from 'cors';
import { exec } from 'child_process'

const app = express()

app.use(express.static('public'))

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// parse application/json
app.use(express.json());

//referencing cors
app.use(cors());

app.get("/api/predict", function (req, res) {
    // Replace 'pythonScript.py' with the path to your Python script
    const pythonScriptPath = 'Python-Code/main.py';

    const pythonProcess = exec(`python ${pythonScriptPath}`);

    // Handle the output (stdout) of the Python script
    pythonProcess.stdout.on('data', (data) => {
        // console.log('Python Script Output:', data);

        if(data.startsWith("[")){
            console.log('Python Script Output:', data);
            res.json(
                {
                    "predictions": data.trim()
                }
            );
        }
    });

    // Handle any errors or exit events
    pythonProcess.on('error', (error) => {
        console.error('Error executing Python script:', error);
    });

    pythonProcess.on('exit', (code) => {
        if (code === 0) {
            console.log('Python script exited successfully.');
        } else {
            console.error('Python script exited with code:', code);
        }
    });

});

const storage = multer.diskStorage({
    destination: 'public/uploads/', // Specify the directory where uploaded files will be saved
    filename: function (req, file, callback) {
        // Rename the file to ensure it doesn't overwrite any existing files
        callback(null, "image" + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

app.use(express.static('public')); // Serve static files like HTML

app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).write('<h1 style="color:red; text-align:center;">No file uploaded.</h1><div style="text-align:center;"><button onclick="history.back();">Back</button></div>');
    }
    res.write('<h1 style="color:green; text-align:center;">File uploaded successfully.</h1><div style="text-align:center;"><button onclick="history.back();">Back</button></div>');
});

let PORT = process.env.PORT || 3011;

app.listen(PORT, function () {
    console.log('App starting on port', PORT)
})