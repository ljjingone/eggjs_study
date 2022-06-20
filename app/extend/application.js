const path = require('path')
module.exports = {
    // 方法扩展
    package(key){
        const packageData = getPath();
        return key ? packageData[key] : packageData
    },
    // 属性扩展
    get allPackage(){
        return getPath();
    }
}

function getPath(){
    const filePath = path.join(process.cwd(), 'package.json');
    const pack = require(filePath)
    return pack
}