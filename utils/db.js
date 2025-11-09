const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Atlas に接続成功'))
.catch(err => {
  console.error('MongoDB 接続エラー:', err);
  process.exit(1);
});

module.exports = mongoose;
