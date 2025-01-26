const cloudinary = require('cloudinary').v2;

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async function(event, context) {
  // 输出环境变量状态（不输出具体值）
  console.log('环境变量检查:', {
    has_cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    has_api_key: !!process.env.CLOUDINARY_API_KEY,
    has_api_secret: !!process.env.CLOUDINARY_API_SECRET
  });

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

    // 检查 Cloudinary 配置
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('未设置 CLOUDINARY_CLOUD_NAME');
    }
    if (!process.env.CLOUDINARY_API_KEY) {
      throw new Error('未设置 CLOUDINARY_API_KEY');
    }
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error('未设置 CLOUDINARY_API_SECRET');
    }

    console.log('开始上传到 Cloudinary...');

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
    console.error('上传错误:', {
      message: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: '上传失败',
        message: error.message,
        details: error.stack
      })
    };
  }
}; 