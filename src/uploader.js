
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const mysql = require('mysql');

// MySQL database connection configuration
const dbConfig = {
    host: '35.232.56.51',
    user: 'whiteboxqa',
    password: 'Innovapath1',
    database: 'whiteboxqa',
};

// Create a MySQL connection
const connection = mysql.createConnection(dbConfig);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

async function uploadVideo(filePath, auth) {
    try {
        const youtube = google.youtube({ version: 'v3', auth });
        const fileSize = fs.statSync(filePath).size;

        // Extract batch ID from the file name
        const fileName = path.basename(filePath);
        const batchId = fileName.split('_')[1]; // Assuming batch ID is after the first underscore

        // Assign 'Shiva cypress5' as the filename to be inserted into the database
        // const extractedFileName = 'Shiva cypress5';

        const res = await youtube.videos.insert({
            part: 'snippet,status',
            notifySubscribers: false,
            requestBody: {
                snippet: {
                    title: fileName,
                    description: fileName, // Use filename as description
                },
                status: {
                    privacyStatus: 'unlisted',
                    quality: 'high',
                },
            },
            media: {
                body: fs.createReadStream(filePath),
            },
        }, {
            onUploadProgress: (evt) => {
                const progress = (evt.bytesRead / fileSize) * 100;
                console.log(`${Math.round(progress)}% complete`);
            },
        });

        console.log('Upload complete:', res.data);
        console.log('YouTube Video ID:', res.data.id);

        // Insert video ID into MySQL database
        const videoId = res.data.id;
        const videoTitle = res.data.snippet.title;
        const currentDate = new Date();
        const batchname = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const classDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

        const lastModDateTime = currentDate.toISOString().slice(0, 10);
        const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;

        const query = `
            INSERT INTO recording (
                videoid, description, batchname, type, classdate,
                link, status, course, subject, isbest, isjumbo,
                iscandidate, filename, lastmoddatetime, batchid, subjectid
            ) VALUES (?, ?, ?, 'class', ?, ?, 'active', 'UI', NULL, 'N', 'N', 'N', 'Cypress', ?, '149', '60')
        `;

        const values = [videoId, videoTitle, batchname, classDate, youtubeLink, lastModDateTime];

        connection.query(query, values, (err, results) => {
            if (err) {
                console.error('Error inserting video ID into MySQL:', err);
            } else {
                console.log('Video ID inserted into MySQL:', results);
            }
        });

        return res.data;
    } catch (error) {
        console.error('Error uploading video to YouTube:', error);
        throw error;
    }
}

module.exports = uploadVideo;

