const mongoose = require('mongoose');

const ProstituteSchema = new mongoose.Schema({
  bid: { type: String, required: true , unique: true },
  name: String,
  twitter: String,
  instagram: String
}, { collection: 'prostitutes', timestamps: true });

module.exports = mongoose.model('Prostitute', ProstituteSchema);