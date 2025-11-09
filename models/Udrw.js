const mongoose = require('mongoose');

const UdrwsSchema = new mongoose.Schema({
  pid: { type: String, required: true , unique: true },
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
  images: {
    main: {
      original: {
        url: String,
        status: String
      },
      archive: {
        url: String,
        status: String
      }
    },
    sub: [
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
  }
}, { collection: 'udrws', timestamps: true });

module.exports = mongoose.model('Udrw', UdrwSchema);