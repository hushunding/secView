const fs = require('fs');
const COS = require('cos-nodejs-sdk-v5');
const path = require('path');

if (false) {
}
else {
    const [_, SecretId, SecretKey ] = process.argv
    const cos = new COS({ SecretId, SecretKey });
    const distpath = {
        Bucket: 'mysecret-1256571816',
        Region: 'ap-shanghai',
    }
    const release = 'release'
    const files = fs.readdirSync(dist);
    let uploadfiles = [];

    for (const file of files) {
        if (fs.statSync(path.join(release, file)).isFile()) {
            uploadfiles.push({
                file: path.join(release, file),
                key: path.posix.join('secview', file)
            })
        }
    }
    
    Promise.all(uploadfiles.map(v => new Promise((resolve, reject) => {
        cos.putObject({
            ...distpath,
            Key: v.key,              /* 必须 */
            StorageClass: 'STANDARD',
            Body: fs.createReadStream(v.file), // 上传文件对象
            onProgress: function (progressData) {
                console.log(JSON.stringify({ key: v.key, ...progressData }));
            }
        }, function (err, data) {
            if (err) {
                reject(err)
            }
            else {
                console.log(JSON.stringify({ key: v.key, percent: 100 }))
            }
        });
    }))).then(()=>{}).catch((err)=>{
        console.error(err);
    })

}
