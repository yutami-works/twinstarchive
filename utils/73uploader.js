const axios = require('axios');
const FormData = require('form-data');

const uploaderUrl = process.env.UPLOADER_URL;

// 画像URLの存在をHEADリクエストでチェックする
const checkImageExists = async (url) => {
  try {
    const response = await axios.head(url, { timeout: 3000 });
    // 成功ステータスコード (2xx) であれば存在する
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    return false;
  }
};

// 画像URLをBuffer化
const imageUrl2buffer = async (url) => {
    const { data } = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
    return Buffer.from(data);
};

// bufferをアップロードし、URLを返却
const uploadBuffer73 = async (buffer, filename) => {
    const formData = new FormData();
    formData.append('files', buffer, { filename });

    const res = await axios.post(uploaderUrl, formData, {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    });
    return res.data.files[0].url;
};

// 画像URLのミラーを生成（アーカイブ処理）
const generate73ArchiveUrl = async (imageUrl) => {
    try {
        // 1. Buffer化
        const imageBuffer = await imageUrl2buffer(imageUrl);

        // 2. ファイル名生成
        const urlParts = new URL(imageUrl).pathname.split('/');
        const originalFilename = urlParts[urlParts.length - 1];
        const filename = `archive-${originalFilename}`;

        // 3. アップロード
        const resultUrl = await uploadBuffer73(imageBuffer, filename);

        console.log(`画像アーカイブ成功: ${resultUrl}`);
        return { url: resultUrl, status: 'active' };

    } catch (error) {
        console.error(`アーカイブ生成失敗: ${imageUrl}. エラー: ${error.message}`);
        // 失敗したら '-' と 'none' を返却
        return { url: '-', status: 'none' };
    }
};

module.exports = {
  generate73ArchiveUrl,
  checkImageExists,
};