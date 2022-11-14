const axios = require('axios');
// import axios from 'axios';
// "jsencrypt": "@3.2.1"
// https://github.com/travist/jsencrypt/issues/147#issuecomment-534359519
global.navigator = { appName: 'nodejs' }; // fake the navigator object
global.window = {}; // fake the window object
const JSEncrypt = require('jsencrypt');

let nonceStr = '8274b210f89a490ab2331a6fe6246d5b';
let publicKey =
  'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCz8Tuhuf29nKaXrkTjZOpeddy/1n5RlcRhSHZzUfRTq0+oIrmKlbHB2NFYCiQytADvQn4Wd0BJNSpz8QhAG+jhF9C5G0xB0+kCzf4jS86ciRSw5qv7o9Nc8RI8cVe9g58dQ3mPH/twQCbWDAho9UlaN34UFE8FXaIo+FfjgERUOQIDAQAB';

const userName = '20183100958';
const pwd = '094917';

const getKey = () => {
  const url = 'http://libzwyy.jlu.edu.cn/ic-web/login/publicKey';
  axios
    .get(url)
    .then(res => {
      cookie = res.headers['set-cookie'][0].split(';')[0];
      console.log('cookie: ', cookie);
      let response = res.data.data;
      nonceStr = response.nonceStr;
      publicKey = response.publicKey;
      login();
    })
    .catch(err => {
      console.log('ERR: ', err);
    });
};

const encrypt = () => {
  const s = pwd + ';' + nonceStr;
  const $encrypt = new JSEncrypt();
  $encrypt.setPublicKey(publicKey);
  let encryptedStr = $encrypt.encrypt(s);
  console.log('encryptedStr: ', encryptedStr);
  return encryptedStr;
};

const login = () => {
  const url = 'http://libzwyy.jlu.edu.cn/ic-web/login/user';
  const params = {
    captcha: '',
    consoleType: 16,
    logonName: userName,
    password: encrypt(),
  };
  console.log('LOGIN_INFO: ', params);
  axios
    .post(url, params, { headers: { cookie } })
    .then(res => {
      console.log('LOGIN: ', res.data.message, res.data.data);
      token = res.data.data.token;
      // code: 300 => 未登录
    })
    .catch(err => {
      console.log('ERR_LOGIN: ', err);
    });
};

getKey();
// encrypt();
