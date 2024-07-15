const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const credentialsPath = path.join(__dirname, '../config/credentials.json');
const tokenPath = path.join(__dirname, '../config/token.json');

async function authenticate() {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath));
    const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;

    if (!client_id || !client_secret || !redirect_uris || !redirect_uris.length) {
        throw new Error('Missing or incorrect credentials in credentials.json');
    }

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    try {
        const token = fs.readFileSync(tokenPath);
        oAuth2Client.setCredentials(JSON.parse(token));
        console.log('Token successfully loaded from token.json');
    } catch (error) {
        console.log('No token found, initiating authentication process...');
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/youtube.upload',
        });
        console.log('Authorize this app by visiting this url:', authUrl);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise((resolve, reject) => {
            rl.question('Enter the code from that page here: ', (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) {
                        console.error('Error retrieving access token', err);
                        reject(err);
                    }
                    oAuth2Client.setCredentials(token);
                    fs.writeFileSync(tokenPath, JSON.stringify(token));
                    console.log('Token stored to', tokenPath);
                    resolve(oAuth2Client);
                });
            });
        });
    }
    return oAuth2Client;
}

module.exports = authenticate;
