// const chokidar = require('chokidar');
// const path = require('path');
// const fs = require('fs');
// const uploadVideo = require('./uploader');

// function watchFolder(uploadPath, donePath, auth) {
//     const watcher = chokidar.watch(uploadPath, {
//         persistent: true,
//         ignoreInitial: true,
//         followSymlinks: false,
//         depth: 0,
//         awaitWriteFinish: {
//             stabilityThreshold: 2000,
//             pollInterval: 100,
//         },
//     });

//     watcher.on('add', async (filePath) => {
//         console.log(`File added: ${filePath}`);
//         try {
//             const videoDetails = await uploadVideo(filePath, auth);
//             const videoID = videoDetails.id;
//             console.log(`Video uploaded successfully. YouTube Video ID: ${videoID}`);

//             const doneFilePath = path.join(donePath, path.basename(filePath));
//             fs.renameSync(filePath, doneFilePath);
//             console.log(`Moved uploaded file to: ${doneFilePath}`);
//         } catch (error) {
//             console.error(`Error processing file ${filePath}:`, error);
//         }
//     });

//     watcher.on('error', (error) => {
//         console.error('Error watching folder:', error);
//     });
// }

// module.exports = watchFolder;



const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const uploadVideo = require('./uploader');

function watchFolder(uploadPath, donePath, auth) {
    const watcher = chokidar.watch(uploadPath, {
        persistent: true,
        ignoreInitial: true,
        followSymlinks: false,
        depth: 0,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100,
        },
    });

    watcher.on('add', async (filePath) => {
        console.log(`File added: ${filePath}`);
        try {
            const videoDetails = await uploadVideo(filePath, auth);
            const videoID = videoDetails.id;
            console.log(`Video uploaded successfully. YouTube Video ID: ${videoID}`);

            const doneFilePath = path.join(donePath, path.basename(filePath));
            fs.renameSync(filePath, doneFilePath);
            console.log(`Moved uploaded file to: ${doneFilePath}`);
        } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
        }
    });

    watcher.on('error', (error) => {
        console.error('Error watching folder:', error);
    });
}

module.exports = watchFolder;
