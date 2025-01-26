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
    
    // 确保图片数据是有效的 base64
    if (!image || !image.startsWith('data:image')) {
      throw new Error('无效的图片数据');
    }

    // 上传图片到 Cloudinary 的 camera-app 文件夹
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'camera-app',
      resource_type: 'image',
      format: 'jpg'
    });

    console.log('上传成功:', uploadResponse.secure_url);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id
      })
    };
  } catch (error) {
    console.error('上传错误:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: '上传失败',
        message: error.message
      })
    };
  }
}; 