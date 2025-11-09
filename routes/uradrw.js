const express = require('express');
const router = express.Router();

// 使用するモデルを読み込み
const Prostitute = require('../models/Prostitute');
const Udrw = require('../models/Udrw');

/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    // 全取得
    const udrwsBaseData = await Udrw.find({});

    // 個別情報加工
    const udrws = await Promise.all(
      udrwsBaseData.map(async (udrw) => {
        return {
          ...udrw.toObject(),
          modal: `modal-${udrw.pid}`,
          carousel: `carousel-${udrw.pid}`
        };
      })
    );

    console.log(udrws);

    // データを渡す
    res.render('uradrw', { udrws: udrws });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: '取得エラー' });
  }
});

module.exports = router;
