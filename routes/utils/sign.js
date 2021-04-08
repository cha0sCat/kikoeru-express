const crypto = require("crypto");
const { config } = require('../../config');


// 用于对 offload media 文件进行签名
// https://developers.cloudflare.com/firewall/recipes/require-valid-hmac-token
// 使用 sha256 方法签名
// 签名内容为路径 + 秒级时间戳
// 签名查询键 verify
const signStaticFileUrl = (rawUrl, timestamp=Date.now() / 1000 | 0) => {
  const url = new URL(rawUrl)
  const hmac = crypto.createHmac('sha256', config.signsecret)
      .update(url.pathname)
      .update(timestamp.toString())
  url.searchParams.append("verify", encodeURIComponent(hmac.digest("base64")));
  return url.href;
}

module.exports = { signStaticFileUrl }