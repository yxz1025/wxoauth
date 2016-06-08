/*
 *微信授权获取用户基本信息，通过code
 */
var urlencode = require('urlencode');
var Q = require("q");
var request = require("request");
//微信授权获取基本信息
var Oauth = {
    //换取code 此处scope支持静默和动态获取两种
    getAuthorizeURL: function(url, appid, scope) {
        var callback_url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + urlencode(url) + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect';
        return callback_url;
    },

    //获取access_token
    getAuthAccessTokenByCode: function(code, appid, secret) {
        // 获取微信签名所需的access_token
        var deferred = Q.defer();
        request('https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + appid + '&secret=' + secret + '&code=' + code + '&grant_type=authorization_code', function(err, response, data) {
            if (err) {
                deferred.reject(err);
            }
            if (!err && response.statusCode == 200) {
                try {
                    var resp = JSON.parse(data);
                    deferred.resolve(resp);
                } catch (e) {
                    deferred.reject(e.message);
                }
            }
        });
        return deferred.promise;
    },

    //获取用户基本信息
    getUserInfo: function(obj) {
        var access_token = obj.access_token;
        var openid = obj.openid;
        var deferred = Q.defer();
        request('https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN', function(err, response, data) {
            if (err) {
                deferred.reject(err);
            }
            if (!err && response.statusCode == 200) {
                try {
                    var resp = JSON.parse(data);
                    deferred.resolve(resp);
                } catch (e) {
                    deferred.reject(e.message);
                }
            }
        });
        return deferred.promise;
    },

    //检查token是否失效
    checkAccessToken: function(access_token, openid) {
        var deferred = Q.defer();
        request('https://api.weixin.qq.com/sns/auth?access_token=' + access_token + '&openid=' + openid, function(err, response, data) {
            if (err) {
                deferred.reject(err);
            }
            if (!err && response.statusCode == 200) {
                try {
                    var resp = JSON.parse(data);
                    deferred.resolve(resp);
                } catch (e) {
                    deferred.reject(e.message);
                }
            }
        });
        return deferred.promise;
    },

    //刷新token
    refreshToken: function(refresh_token, appid) {
        var deferred = Q.defer();
        https.get('https://api.weixin.qq.com/sns/oauth2/refresh_token?appid=' + appid + '&grant_type=refresh_token&refresh_token=' + refresh_token, function(_res) {
            var str = '';
            _res.on('data', function(data) {
                str += data;
            });
            _res.on('end', function() {
                console.log('return access_token:  ' + str);
                try {
                    var resp = JSON.parse(str);
                    deferred.resolve(resp);
                } catch (e) {
                    deferred.reject(e.message);
                }
            });
        });
        return deferred.promise;
    },
};
module.exports = Oauth;

//调用说明
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
