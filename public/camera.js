window.onload = async function() {
    const message = document.querySelector('.message');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
        message.textContent = '摄像头已就绪，正在拍照...';

        // 等待视频加载
        video.onloadeddata = async function() {
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            const photo = document.getElementById('photo');
            
            // 设置画布大小
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // 拍照并上传
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 将图片转换为 base64
            const image = canvas.toDataURL('image/jpeg', 0.8);
            
            // 显示拍摄的照片
            photo.src = image;
            photo.style.display = 'block';
            message.textContent = '照片已拍摄，正在上传...';
            
            try {
                // 发送到 Netlify Function
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image: image })
                });

                const data = await response.json();
                
                if (data.success) {
                    message.textContent = '照片已成功保存！';
                    console.log('照片URL:', data.url);
                } else {
                    throw new Error(data.message || '保存失败');
                }
            } catch (err) {
                message.textContent = '保存照片时出错: ' + err.message;
                console.error('上传错误:', err);
            }

            // 关闭摄像头
            stream.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
        };
    } catch (err) {
        message.textContent = '无法访问摄像头: ' + err.message;
        console.error('无法访问摄像头:', err);
    }
}; 