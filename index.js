/*
 *微信授权获取用户基本信息，通过code
 */
var urlencode = require('urlencode');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require("request"));
var co = require("co");
//微信授权获取基本信息
function Oauth() {};

//换取code 此处scope支持静默和动态获取两种
Oauth.prototype.getAuthorizeURL = function(url, appid, scope) {
    var callback_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + urlencode(url) + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect';
    return callback_url;
};

//获取access_token 返回一个加上co函数表示为将一个generator变成promise yield 和 await都是promise
Oauth.prototype.getAuthAccessTokenByCode = co.wrap(function* (code, appid, secret) {
    var content = yield request.getAsync('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code');
    return JSON.parse(content.body);
});

//获取用户基本信息
Oauth.prototype.getUserInfo = co.wrap(function* (code, appid, secret) {
    var self = this;
    var content = yield self.getAuthAccessTokenByCode(code, appid, secret);
    var userinfo = yield request.getAsync('https://api.weixin.qq.com/sns/userinfo?access_token=' + content.access_token + '&openid=' + content.openid + '&lang=zh_CN');
    return JSON.parse(userinfo.body);
});

//检查token是否失效
Oauth.prototype.checkAccessToken = co.wrap(function* (access_token, openid) {
    var check_token = yield request.getAsync('https://api.weixin.qq.com/sns/auth?access_token=' + access_token + '&openid=' + openid);
    return JSON.parse(check_token.body);
});

//刷新token
Oauth.prototype.refreshToken = co.wrap(function* (refresh_token, appid) {
    var refresh_token = yield request.getAsync('https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + appid + '&grant_type=refresh_token&refresh_token=' + refresh_token);
    return JSON.parse(refresh_token.body);
});

module.exports = new Oauth();