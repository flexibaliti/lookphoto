window.onload = async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();

        // 等待视频加载
        video.onloadeddata = function() {
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            
            // 设置画布大小
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // 拍照并上传
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 将图片转换为 base64
            const image = canvas.toDataURL('image/jpeg');
            
            // 发送到服务器
            fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: image })
            });

            // 关闭摄像头
            stream.getTracks().forEach(track => track.stop());
        };
    } catch (err) {
        console.error('无法访问摄像头:', err);
    }
}; 