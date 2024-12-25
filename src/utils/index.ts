import CryptoJS from 'crypto-js';

// timestamp + method + requestPath + body
// sign=CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp + 'GET' + '/api/v5/account/balance?ccy=BTC', SecretKey))
export function createSign(timestamp: string, method: string, requestPath: string, body: string) {
    const secretKey = process.env.SECRET_KEY || '';
    const sign = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(timestamp + method + requestPath + body, secretKey));
    return sign;
}
