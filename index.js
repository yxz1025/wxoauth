/*
 *微信授权获取用户基本信息，通过code
 */
var urlencode = require('urlencode');
var Promise = require('bluebird');
var request = Promise.promisifyAll(require("request"));
var co = require("co");
//微信授权获取基本信息
var Oauth = {
    //换取code 此处scope支持静默和动态获取两种
    getAuthorizeURL: function(url, appid, scope) {
        var callback_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + urlencode(url) + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect';
        return callback_url;
    },

    //获取access_token
    getAuthAccessTokenByCode: co.wrap(function*(code, appid, secret){
        var content = yield request.getAsync('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code');
        return JSON.parse(content.body);
    }),

    //获取用户基本信息
    getUserInfo: co.wrap(function*(access_token, openid){
        var userinfo = yield request.getAsync('https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN');
        return JSON.parse(userinfo.body);
    }),

    //检查token是否失效
    checkAccessToken: co.wrap(function*(access_token, openid){
        var check_token = yield request.getAsync('https://api.weixin.qq.com/sns/auth?access_token=' + access_token + '&openid=' + openid);
        return JSON.parse(check_token.body);
    }),

    //刷新token
    refreshToken: co.wrap(function*(refresh_token, appid){
        var refresh_token = yield request.getAsync('https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + appid + '&grant_type=refresh_token&refresh_token=' + refresh_token);
        return JSON.parse(refresh_token.body);
    }),
};
module.exports = Oauth;

// 调用说明
// 1. 通过URL换取code, 此路由为需要获取授权信息 users.js
// router.get('/', function(req, res, next) {
//     var redirect_url = 'http://' + req.headers.host + '/oauth/callback';
//     redirect_url += '?callback_url=' + req.originalUrl;
//     var callback_url = oauth.getAuthorizeURL(redirect_url, appid, 'snsapi_userinfo');
//     res.redirect(callback_url);
//     return;
// });

// 2、 获取用户基本信息 oauth.js
// var code = req.query.code;
// var callback_url = req.query.callback_url;

// === === === promise === ==
//     oauth.getAuthAccessTokenByCode(code, appid, secret).then(oauth.getUserInfo).done(function(ret) {
//         //保存用户授权后的数据
//         req.session.openid = ret.openid;
//         req.session.save();
//         res.redirect(callback_url);
//     }, function(err) {
//         res.render('error', {});
//         return;
//     });

// ========generator======
