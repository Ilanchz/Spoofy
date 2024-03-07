import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import axios from "axios";
import queryString from "querystring";
import { google } from 'googleapis';

const app = express();
app.use(express.static("public"));
app.use(express.static("downloads"));
app.use(express.urlencoded({ extended: true }));


const config={
  type: "audio",
  quality: 128
}

const port = 3000;

let datetime=new Date();
let token_flag=1;
let given_id;
let token;




function getArtists(song_data){
    let Artists=[];
    for (let i=0;i<song_data.artists.length;i++){
        Artists.push(song_data.artists[i].name);
    }
    return Artists;
}


app.get("/account", async (req, res) => {
    if (token_flag===1 || Math.ceil((new Date()-datetime)/1000)>3600){
        try {
            const authHeader = Buffer.from(`${process.env.CLIENTID}:${process.env.CLIENTSECRET}`).toString(
              "base64"
            );
        
            const spotifyResponse = await axios.post(
              "https://accounts.spotify.com/api/token",
              queryString.stringify({
                grant_type: "authorization_code",
                code: req.query.code,
                redirect_uri: "http://localhost:3000/account",
              }),
              {
                headers: {
                  Authorization: `Basic ${authHeader}`,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
              }
            );
            datetime=new Date();
            token_flag=0;
            token=spotifyResponse.data.access_token;
          } catch (error) {
            console.error("Error:");
          }

    }

    const song_data = await axios.get(
        "https://api.spotify.com/v1/tracks/"+given_id,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      let Artists=getArtists(song_data.data);


      let searchString=song_data.data["name"]+" By ";
      for (let i=0;i<Artists.length;i++){
        searchString=searchString+Artists[i]
        if (i!==Artists.length-1){
            searchString=searchString+",";
        }
      }
      searchString = searchString.replace(/"/g, "");


      res.render("index.ejs",{data: searchString});


      const searchQuery = searchString; // Modify as needed

      // Perform a search using the YouTube API

      const youtube = google.youtube({
        version: 'v3',
        auth: process.env.YOUTUBE_API,
         // Replace with your actual YouTube API key
      });


      const youtubeSearchResponse = await youtube.search.list({
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults: 10, // Adjust as needed
      });

      let first_results=youtubeSearchResponse;
      let url_youtube="";
      try{
        url_youtube=first_results.data.items[0].id.videoId;
        url_youtube="https://youtu.be/"+url_youtube;

        try {
          await dlAudio({
            url: url_youtube,
            folder: "downloads", // optional, default: "youtube-exec"
            filename: searchQuery, // optional, default: video title
            quality: "best", // or "lowest"; default: "best"
          });
          console.log("Audio downloaded successfully! 🔊🎉");
          res.download(`downloads/${searchQuery}.mp3`);


        } catch (err) {
          console.error("An error occurred:", err.message);
        }
        


      }catch (err){
        console.log("Error!");
      }
      

  
});

app.post("/Authenticate",(req,res)=>{

    let Parts=req.body["link"].split("/");
    given_id=Parts[Parts.length-1];
    given_id=given_id.split("?")[0];
    res.redirect(
        `https://accounts.spotify.com/authorize?client_id=${process.env.CLIENTID}&response_type=code&redirect_uri=${process.env.REDIRECTURI}&scope=user-top-read`
    );
})



app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
