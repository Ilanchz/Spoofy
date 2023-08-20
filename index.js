import express from "express";
import axios from "axios";
import queryString from "querystring";
import { google } from 'googleapis';
import { dlAudio } from "youtube-exec";


const config={
  type: "audio",
  quality: 128
}

const youtube_api='';   //Update the API keys 
const port = 3000;
const clientId = "";
const clientSecret = "";
const redirectUri = "";


let datetime=new Date();
let token_flag=1;
let given_id;
let token;


const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));


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
            const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
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
            console.log("Success!");
          } catch (error) {
            console.error("Error:");
          }

    }
    console.log("Done!");

    const song_data = await axios.get(
        "https://api.spotify.com/v1/tracks/"+given_id,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      let Artists=getArtists(song_data.data);

      console.log(Artists);

      let searchString=song_data.data["name"]+" By ";
      for (let i=0;i<Artists.length;i++){
        searchString=searchString+Artists[i]
        if (i!==Artists.length-1){
            searchString=searchString+",";
        }
      }
      console.log(searchString);

      res.render("index.ejs",{data: searchString});


      const searchQuery = searchString; // Modify as needed

      // Perform a search using the YouTube API

      const youtube = google.youtube({
        version: 'v3',
        auth: youtube_api,
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
        console.log(url_youtube);

        try {
          await dlAudio({
            url: url_youtube,
            folder: "downloads", // optional, default: "youtube-exec"
            filename: searchQuery, // optional, default: video title
            quality: "best", // or "lowest"; default: "best"
          });
          console.log("Audio downloaded successfully! 🔊🎉");


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
    console.log(given_id);
    res.redirect(
        `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=user-top-read`
    );
})



app.get("/", (req, res) => {
    res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
