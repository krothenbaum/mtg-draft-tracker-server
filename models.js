const mongoose = require('mongoose');

const draftSchema = mongoose.Schema({
  date: {type: Date, default: Date.now},
  sets: String,
  format: String,
  colorsPlayed: String,
  matches: [{
    matchName: String,
    matchWon: Boolean,
    gamesWon: Number,
    gamesLost: Number
  }]
});

const userSchema = mongoose.Schema({
  name: {
    firstName: String,
    lastName: String
  },
  email: {type: String, required: true},
  password: {type: String},
  created: {type: Date, default: Date.now},
  drafts: [draftSchema]
});

userSchema.virtual('userName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`.trim();
});

userSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    name: this.userName,
    email: this.email,    
    created: this.created,
    drafts: this.drafts
  };
}

userSchema.methods.draftRepr = function() {
  return {
    id: this.drafts._id,
    sets: this.drafts.sets,
    format: this.drafts.format,
    colorsPlayed: this.drafts.colorsPlayed,
    matches: this.drafts.matches
  };
}

const User = mongoose.model('User', userSchema);

module.exports = {User};