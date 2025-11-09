const mongoose = require('mongoose');

const UdrwSchema = new mongoose.Schema({
  pid: { type: String, required: true , unique: true },
  name: String,
  relationalBid: String,
  link: {
    original: {
      url: String,
      status: String
    },
    archive: {
      url: String,
      status: String
    }
  },
  images: [
    {
      original: {
        url: String,
        status: String
      },
      archive: {
        url: String,
        status: String
      }
    }
  ]
}, { collection: 'udrws', timestamps: true });

module.exports = mongoose.model('Udrw', UdrwSchema);
