# Spoofy
A web-app leveraging spotify API to find songs and youtube API to download the songs.
The songs are downloaded based upon the youtube ranking of most relevant music.

Disclaimer: This app uses only the npm modules provided to download the files no files belong to this account

Requirement:
FFMpeg is required to download the youtube songs make sure to install and add to path.

Documentation:

This section of code need to updated with proper credential for the project to work!

const youtube_api='Register with youtube API provider and get API key'
const port = Select your port to host the server 
const clientId = " Spotify API client id which will be obtained after registering "
const clientSecret = " Spotify API client id which will be obtained after registering "
const redirectUri = " The Url to redirect back to your web app or endpoint ";

or

Use Environment variables to store the API keys and passwords (Recommended)

Dependencies

    "axios": "^1.4.0",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "ffmpeg": "^0.0.4",
    "googleapis": "^126.0.0",
    "youtube-exec": "^1.0.4"
  

npm install all the packages

Base64 Decoding and Encoding:
https://www.base64encode.org/

Documentation Guide for working with Spotify API:
https://developer.spotify.com/documentation/web-api

Documentation Guide for working with Youtube API:
https://developers.google.com/youtube






