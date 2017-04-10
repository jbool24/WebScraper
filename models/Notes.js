const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Note schema
const NoteSchema = new Schema({

  title: {
    type: String
  },

  body: {
    type: String
  }
});

const Note = mongoose.model("Note", NoteSchema);
// Export the Note model
module.exports = Note;
