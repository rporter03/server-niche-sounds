const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const mongoose = required("mongoose");
const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

  /* let artists = [
    {
        "_id": 1,
        "artist": "Forth Wanderers",
        "genre": "Indie Rock",
        "Description": "Forth Wanderers are an Indie Rock band with a unique sound. The use unique melodies that are hard to predict where they go next, which makes an enjoyable listening experience. They have released multiple albums and EPs since 2013, with their most recent album releasing earlier this year in July 2025.",
        "img": "images/forth-wanderers.jpg"
    },{
        "_id": 2,
        "artist": "The Strokes",
        "genre": "Alternative/Indie",
        "Description": "The Strokes is a band that needs no mention; they are one of the most popular alternative/indie bands out there, with hundreds of millions of plays for multiple songs. They have a wide discography and most recently have put out an album in 2020 and 2023.",
        "img": "images/the-strokes.jpg"
    },{
        "_id": 3,
        "artist": "Battles",
        "genre": "Experimental Rock",
        "Description": "Battles is a band that produces experimental rock music. They have a very unique sound as their music is composed of unnatural rhythms and intervals, but create an extraordinary sound. They have been active since the mid 2000s and have most recently released multiple EP's in 2020.",
        "img": "images/battles.jpg"
    },{
        "_id": 4,
        "artist": "Should",
        "genre": "Alternative/Indie",
        "Description": "Should is an alternative/indie band that has been occasionally active since the late 90s. As of 2025, they have released two singles after a long eleven year gap. They make great indie music with hints of shoegaze.",
        "img": "images/should.jpg"
    },{
        "_id": 5,
        "artist": "Kind of Like Spitting",
        "genre": "Indie Rock",
        "Description": "Kind of Like Spitting was an indie rock band that were active in the late 90s, early 2000s, and recently again in 2025. The band has a wide discography and have just released their final album this October, marking the end of the band.",
        "img": "images/spitting.jpg"
    },{
        "_id": 6,
        "artist": "Tabar",
        "genre": "Math Pop",
        "Description": "Tabar was a math pop band that was very short lived, only releasing one EP with three songs in 2010. However, their sound is incredible and very enjoyable to listen to. Their recent whereabouts are unknown and recent forum posts suggest they have no presence online.",
        "img": "images/tabar.png"
    },{
        "_id": 7,
        "artist": "Adult Mom",
        "genre": "Alternative/Indie",
        "Description": "Adult Mom is the project of musician Stevie Knipe, who was originally the only member. However, Adult Mom has grown to become a full band with multiple members. Adult Mom has released six full length albums with a multitude of singles. Their sound can be described as soft, sad, and very emotional.",
        "img": "images/adult-mom.jpg"
    },{
        "_id": 8,
        "artist": "Brittle Stars",
        "genre": "Indie Pop",
        "Description": "Coming from Florida in the late 90s, Brittle Stars were an indie pop band with short, sweat, and dreamy sounding songs. They have released two albums and as of more recently, have released two singles as well. The band was composed of four members who each brought their own instrument to life in their sounds.",
        "img": "images/brittle-stars.webp"
    }
] */

mongoose
  .connect("mongodb+srv://porterclayton2003_db_user:SRUfH5ndmxyRvAw5@cluster0.pueteib.mongodb.net/")
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

const schema = new mongoose.Schema({
  name: String,
});

const artistSchema = new mongoose.Schema({
    artist:String,
    genre:String,
    Description:String,
    img:String
});

const Artist = mongoose.model("Artist", artistSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/artists/", async(req, res)=>{
    console.log("in get request")
    const artists = await Artist.find();
    res.send(artists);
});

app.get("/api/artists/:id", (req, res)=>{
    const artist = artists.find((artist)=>artist._id === parseInt(req.params.id));
    res.send(artist);
});

app.post("/api/artists", upload.single("img"), async(req,res)=>{
    console.log("in post request");
    const result = validateArtist(req.body);


    if(result.error){
        console.log("I have an error");
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const artist = {
        // _id: artists.length+1    -   id is provided by db
        artist:req.body.artist,
        genre:req.body.genre,
        Description:req.body.Description, 
    };

    //adding image
    if(req.file){
        artist.img = "images/" + req.file.filename;
    }

    /* artists.push(artist);
    res.status(200).send(artist); */
    const newArtist = await artist.save();
    res.status(200).send(newArtist);
});

app.put("/api/artists/:id", upload.single("img"), async(req,res)=>{
    /* const artist = artists.find((a)=>a._id===parseInt(req.params.id));

    if(!artist) {
        res.status(404).send("The artist you wanted to edit is unavailable");
        return;
    } */

    const isValidUpdate = validateArtist(req.body);

    if(isValidUpdate.error){
        console.log("Invalid Info");
        res.status(400).send(isValidUpdate.error.details[0].message);
        return;
    }

    /* artist.artist = req.body.artist;
    artist.genre = req.body.genre;
    artist.Description = req.body.Description;

    if(req.file){
        artist.img = "images/" + req.file.filename;
    } */

    const fieldsToUpdate = {
        artist:req.body.artist,
        genre:req.body.genre,
        Description:req.body.Description
    }

    if(req.file) {
        fieldsToUpdate.img = req.file.filename;
    }

    const success = await Artist.updateOne({_id:req.params.id}, fieldsToUpdate);

    if(!success) {
        res.status(404).send("Could not locate the artist to edit");
        return;
    }

    const artist = await Artist.findById(req.params.id);
    res.status(200).send(artist);
});

app.delete("/api/artists/:id", async(req,res)=>{
    //const artist = artists.find((a)=>a._id===parseInt(req.params.id));
    const artist = await Artist.findByIdAndDelete(req.params.id);

    if(!artist) {
        res.status(404).send("The artist you wanted to delete is unavailable");
        return;
    }

    /*const index = artists.indexOf(artist);
    artists.splice(index, 1);*/
    res.status(200).send(artist);
});

const validateArtist = (artist) => {
    const schema = Joi.object({
        _id:Joi.allow(""),
        artist:Joi.string().min(3).required(),
        genre:Joi.string().required().min(3),
        Description:Joi.string().required().min(10),
        img:Joi.allow(""),
    });

    return schema.validate(artist);
};

app.listen(3001, () => {
    console.log("Server is up and running");
});