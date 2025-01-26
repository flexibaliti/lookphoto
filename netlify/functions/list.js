const cloudinary = require('cloudinary').v2;

// 配置 Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '方法不允许' })
    };
  }

  try {
    // 获取 camera-app 文件夹中的所有资源
    const result = await cloudinary.search
      .expression('folder:camera-app')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        photos: result.resources.map(resource => ({
          url: resource.secure_url,
          created_at: resource.created_at
        }))
      })
    };
  } catch (error) {
    console.error('获取照片列表失败:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '获取照片列表失败' })
    };
  }
}; 