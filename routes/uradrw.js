const express = require('express');
const router = express.Router();

// 使用するモデルを読み込み
const Prostitute = require('../models/Prostitute');
const Udrw = require('../models/Udrw');

const { generate73ArchiveUrl, checkImageExists } = require('../utils/73uploader'); // 新規作成したユーティリティを読み込み

const BASE_URL = 'https://d-rw.com/Form/Product/ProductDetail.aspx?pid=';
const BASE_IMAGE_URL_MAIN = 'https://d-rw.com/Contents/ProductImages/0/';
const BASE_IMAGE_URL_SUB = 'https://d-rw.com/Contents/ProductSubImages/0/';

// GET /uradrw/register: 新規登録フォーム表示
router.get('/register', async (req, res) => {
  try {
    // Prostituteの全量を取得（プルダウン用）
    const prostitutes = await Prostitute.find({}).select('bid name').sort('bid');
    res.render('udrw-register', { prostitutes: prostitutes });
  } catch (error) {
    console.error(error);
    res.status(500).send('登録フォームの表示エラー');
  }
});


// POST /uradrw/register: 新規登録処理
router.post('/register', async (req, res) => {
  const { pid, name, relationalBid, originalStatus, archiveUrl, archiveStatus } = req.body;

  try {
    // 1. 画像URLのリストを生成（11個）
    const imageUrls = [];
    imageUrls.push(`${BASE_IMAGE_URL_MAIN}${pid}_LL.jpg`); // メイン画像
    for (let i = 1; i <= 10; i++) {
        const xx = i < 10 ? `0${i}` : `${i}`;
        imageUrls.push(`${BASE_IMAGE_URL_SUB}${pid}_sub${xx}_LL.jpg`); // サブ画像
    }

    // 2. 画像の存在チェックとアーカイブ処理を並行実行
    const imageCreationPromises = imageUrls.map(async (url) => {
      // 存在チェック
      const exists = await checkImageExists(url);

      if (!exists) {
        return null; // 存在しない場合はスキップ
      }

      // 存在する画像に対してアーカイブ処理を実行
      const archiveData = await generate73ArchiveUrl(url);

      return {
        original: {
          url: url,
          status: 'active'
        },
        archive: archiveData
      };
    });

    // 全ての非同期処理（存在チェックとアーカイブ）を待つ
    const imagesArray = await Promise.all(imageCreationPromises);

    // null（存在しなかった画像）を除外し、有効な画像データのみを抽出
    const finalImages = imagesArray.filter(img => img !== null);

    // 3. Udrwオブジェクトの構築
    const newUdrw = {
      pid: pid,
      name: name,
      relationalBid: relationalBid,
      link: {
        original: {
          url: `${BASE_URL}${pid}`, // ex) https://d-rw.com/Form/Product/ProductDetail.aspx?pid=ru59051
          status: originalStatus
        },
        archive: {
          url: archiveUrl || '-', // 空欄なら '-'
          status: archiveStatus
        }
      },
      images: finalImages
    };

    // 4. MongoDBに登録
    await Udrw.create(newUdrw);

    res.redirect('/uradrw'); // 登録完了後、一覧画面へリダイレクト
  } catch (error) {
    // 登録エラー処理
    console.error('Udrw登録エラー:', error);
    if (error.code === 11000) {
        res.status(400).send(`エラー: PID "${req.body.pid}" は既に登録されています。`);
    } else {
        res.status(500).send('Udrwの新規登録中にエラーが発生しました。');
    }
  }
});

/* GET default page */
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
