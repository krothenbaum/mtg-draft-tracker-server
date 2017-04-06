const mongoose = require('mongoose');

const DraftSchema = mongoose.Schema({
  draft: {
    date: Date,
    set: String,
    format: String,
    colors: String,
    prizes: String,
    matches: [match]
  }
});


DraftSchema.virtual('userName').get(function() {
  return `${this.name.firstName} ${this.name.lastName}`.trim();
});

DraftSchema.methods.apiRepr = function() {
  return {
    id: this._id,
    name: this.userName,
    email: this.email,    
    created: this.created,
    drafts: this.drafts
  };
}

const DraftUser = mongoose.model('DraftUser', draftUserSchema);

module.exports = {DraftUser};
