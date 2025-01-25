window.onload = async function() {
    const message = document.querySelector('.message');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
        message.textContent = '摄像头已就绪，正在拍照...';

        // 等待视频加载
        video.onloadeddata = function() {
            const canvas = document.getElementById('canvas');
            const context = canvas.getContext('2d');
            const photo = document.getElementById('photo');
            
            // 设置画布大小
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // 拍照并上传
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // 将图片转换为 base64
            const image = canvas.toDataURL('image/jpeg');
            
            // 显示拍摄的照片
            photo.src = image;
            photo.style.display = 'block';
            message.textContent = '照片已拍摄并上传';
            
            // 发送到服务器
            fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: image })
            }).then(response => response.json())
              .then(data => {
                  if(data.success) {
                      message.textContent = '照片已成功保存';
                  }
              })
              .catch(err => {
                  message.textContent = '保存照片时出错';
                  console.error('上传错误:', err);
              });

            // 关闭摄像头
            stream.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
        };
    } catch (err) {
        message.textContent = '无法访问摄像头: ' + err.message;
        console.error('无法访问摄像头:', err);
    }
}; 