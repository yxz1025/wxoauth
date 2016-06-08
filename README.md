# wxoauth
微信授权获取用户基本信息
# 调用说明(1)express
### 1. 通过URL换取code, 此路由为需要获取授权信息 users.js
        var oauth = require("wxoauth");
        router.get('/', function(req, res, next) {
            var redirect_url = 'http://' + req.headers.host + '/oauth/callback';
            redirect_url += '?callback_url=' + req.originalUrl;
            var callback_url = oauth.getAuthorizeURL(redirect_url, appid, 'snsapi_userinfo');
            res.redirect(callback_url);
            return;
        });

### 2、 获取用户基本信息 oauth.js
        var oauth = require("wxoauth");
        var code = req.query.code;
        var callback_url = req.query.callback_url;
        oauth.getAuthAccessTokenByCode(code, appid, secret).then(oauth.getUserInfo).done(function(ret) {
            //保存用户授权后的数据
            req.session.openid = ret.openid;
            req.session.save();
            res.redirect(callback_url);
        }, function(err) {
            res.render('error', {});
            return;
        });

========generator(koa2调用说明)======
### 1. 通过URL换取code, 此路由为需要获取授权信息 users.js
        var oauth = require("wxoauth");
        router.get('/', async function(ctx, next) {
            var redirect_url = 'http://' + ctx.host + '/oauth/callback'; //跳转路由
            redirect_url += '?callback_url=' + urlencode(ctx.originalUrl);
            var callback_url = oauth.getAuthorizeURL(redirect_url, appid, 'snsapi_userinfo');
            ctx.redirect(callback_url);
        });

### 2、 获取用户基本信息 oauth.js
        var oauth = require("wxoauth");
        router.get('/callback', async function(ctx, next){
            var code = ctx.query.code;
            var callback_url = ctx.query.callback_url;
            var content = await oauth.getAuthAccessTokenByCode(code, appid, secret);
            var userinfo = await oath.getUserInfo(content);
        })
