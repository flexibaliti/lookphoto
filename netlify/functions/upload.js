const cloudinary = require('cloudinary').v2;

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '方法不允许' })
    };
  }

  try {
    const { image } = JSON.parse(event.body);
    
    // 上传图片到 Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'camera-app'
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        url: uploadResponse.secure_url
      })
    };
  } catch (error) {
    console.error('上传错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '上传失败' })
    };
  }
}; 