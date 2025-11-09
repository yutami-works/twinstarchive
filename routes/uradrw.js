const express = require('express');
const router = express.Router();

// 使用するモデルを読み込み
const Prostitute = require('../models/Prostitute');
const Udrw = require('../models/Udrw');

/* GET users listing. */
router.get('/', async (req, res) => {
  try {
    // udrws全取得
    const udrwsBaseData = await Udrw.find({}).sort({ pid: -1 });

    // relationalBid抽出
    const requiredBids = udrwsBaseData.map(udrw => udrw.relationalBid).filter(bid => bid);
    const prostitutes = await Prostitute.find({ bid: { $in: requiredBids } });
    const prostituteMap = prostitutes.reduce((map, p) => {
      map[p.bid] = p.name;
      return map;
    }, {});

    // 個別情報加工
    const udrws = udrwsBaseData.map(udrw => {
      const udrwObject = udrw.toObject();

      let prstName = 'モデル不明';
      if (udrwObject.relationalBid) {
          prstName = prostituteMap[udrwObject.relationalBid] || 'モデル不明';
      }

      return {
        ...udrwObject,
        prstName: prstName,
        modal: `modal-${udrw.pid}`,
        carousel: `carousel-${udrw.pid}`
      };
    });

    // データを渡す
    res.render('uradrw', { udrws: udrws });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: '取得エラー' });
  }
});

module.exports = router;
