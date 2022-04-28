const express = require("express");
const fetchuser = require("../middleware/fetchuser");
const router = express.Router();
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

// ROUTE 1
// Get all the notes of a user: GET "/api/notes/fetchallnotes". Login Required.
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).send("Some error occured on the server side");
  }
});

// ROUTE 3
// Edit a note: POST "/api/notes/update". Login Required.
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid Title").isLength(
      { min: 3 }
    ),
    body("description", "Description must be of atleast 5 characters").isLength(
      { min: 10 }
    ),
  ],
  async (req, res) => {
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;
      const note = new Note({
        user: req.user.id,
        title,
        description,
        tag,
      });
      const savedNote = await note.save();
      res.send(savedNote);
    } catch (error) {
      res.status(500).send("Some error occured on the server side");
    }
  }
);

// ROUTE 3
// Add a new note: PUT "/api/notes/updatenote/:id". Login Required.
router.put("/updatenote/:id", 
  fetchuser, 
  [
    body("title", "Enter a valid Title").isLength(
      { min: 3 }
    ),
    body("description", "Description must be of atleast 5 characters").isLength(
      { min: 10 }
    ),
  ],
  async (req, res) => {
    // If there are errors, return Bad Request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  try {
    const { title, description, tag } = req.body;

    // A newNote object
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    // Find the note to be updated, and update it
    let note = await Note.findById(req.params.id);
    if(!note){
      return res.status(404).send("Not Found");
    }

    if(note.user.toString() != req.user.id){
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
    res.json({note});
  } catch (error) {
    res.status(500).send("Some error occured on the server side");
  }
});


// ROUTE 4
// Delete an existing note: DELETE "/api/notes/deletenote/:id". Login Required.
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    // Find the note to be deleted, and delete it
    let note = await Note.findById(req.params.id);
    if(!note){
      return res.status(404).send("Not Found");
    }

    // Allow deletion only for the owner of the notes
    if(note.user.toString() != req.user.id){
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    res.json({"Success": "Note has been Deleted", note: note});
  } catch (error) {
    res.status(500).send("Some error occured on the server side");
  }
});

module.exports = router;
