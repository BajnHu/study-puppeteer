const utils = require('./utils');
const keys = require('./keys');

const plainText = '你好，我是程序猿小卡';
const crypted = utils.encrypt(plainText, keys.pubKey); // 加密
const decrypted = utils.decrypt(crypted, keys.privKey); // 解密

console.log(decrypted.toString()); // 你好，我是程序猿小卡