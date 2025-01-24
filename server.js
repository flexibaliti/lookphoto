const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json({limit: '50mb'}));
app.use(express.static('public'));

let imageCount = 0;
const MAX_IMAGES = 100;

// 处理图片上传
app.post('/upload', (req, res) => {
    const base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, '');
    
    // 创建 images 文件夹（如果不存在）
    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)){
        fs.mkdirSync(imagesDir);
    }
    
    // 保存图片
    const filename = `image_${Date.now()}.jpg`;
    fs.writeFileSync(path.join(imagesDir, filename), base64Data, 'base64');
    
    imageCount++;
    
    // 如果图片数量达到100，清理最旧的图片
    if (imageCount >= MAX_IMAGES) {
        const files = fs.readdirSync(imagesDir)
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(imagesDir, file)).mtime.getTime()
            }))
            .sort((a, b) => a.time - b.time);
            
        // 删除最旧的图片，只保留最新的50张
        files.slice(0, files.length - 50).forEach(file => {
            fs.unlinkSync(path.join(imagesDir, file.name));
        });
        
        imageCount = 50;
    }
    
    res.json({ success: true });
});

// 后台查看页面
app.get('/admin', (req, res) => {
    const imagesDir = path.join(__dirname, 'images');
    const images = fs.readdirSync(imagesDir)
        .map(file => `/images/${file}`);
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>已保存的图片</title>
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
                        <img src="${img}">
                        <p>拍摄时间: ${new Date(parseInt(img.split('_')[1])).toLocaleString()}</p>
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
    `;
    
    res.send(html);
});

// 提供图片访问
app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(3000, () => {
    console.log('服务器运行在 http://localhost:3000');
}); 