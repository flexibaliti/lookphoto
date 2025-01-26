const express = require('express');
const { put, list, del } = require('@vercel/blob');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.static('public'));

// 处理图片上传
app.post('/upload', async (req, res) => {
    try {
        const base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // 上传到 Vercel Blob Storage
        const filename = `image_${Date.now()}.jpg`;
        const blob = await put(filename, buffer, {
            access: 'public',
            contentType: 'image/jpeg'
        });

        // 获取现有图片列表
        const { blobs } = await list();
        
        // 如果图片数量超过100，删除最旧的图片
        if (blobs.length > 100) {
            const sortedBlobs = blobs.sort((a, b) => a.uploadedAt - b.uploadedAt);
            const blobsToDelete = sortedBlobs.slice(0, sortedBlobs.length - 50);
            
            for (const blobToDelete of blobsToDelete) {
                await del(blobToDelete.url);
            }
        }
        
        res.json({ success: true, url: blob.url });
    } catch (error) {
        console.error('上传错误:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 后台查看页面
app.get('/admin', async (req, res) => {
    try {
        const { blobs } = await list();
        const images = blobs.map(blob => ({
            url: blob.url,
            time: new Date(blob.uploadedAt).toLocaleString()
        }));

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>已保存的图片</title>
                <meta charset="UTF-8">
                <style>
                    .image-container { display: flex; flex-wrap: wrap; }
                    .image-item { margin: 10px; }
                    img { max-width: 300px; }
                </style>
            </head>
            <body>
                <h1>已保存的图片</h1>
                <div class="image-container">
                    ${images.map(img => `
                        <div class="image-item">
                            <img src="${img.url}">
                            <p>拍摄时间: ${img.time}</p>
                        </div>
                    `).join('')}
                </div>
            </body>
            </html>
        `;
        
        res.send(html);
    } catch (error) {
        res.status(500).send('获取图片列表失败: ' + error.message);
    }
});

// 确保所有静态文件都能被访问
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/camera.js', (req, res) => {
    res.sendFile(__dirname + '/camera.js');
});

// 为了 Vercel，需要导出 app
module.exports = app;

// 本地开发时使用
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log('服务器运行在 http://localhost:3000');
    });
} 