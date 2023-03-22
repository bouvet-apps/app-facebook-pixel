const libs = {
  portal: require("/lib/xp/portal"),
  cache: require("/lib/cache")
};

const forceArray = (data) => {
  if (data === undefined || data === null || (typeof data === "number" && isNaN(data))) return [];
  return Array.isArray(data) ? data : [data];
};

const siteConfigCache = libs.cache.newCache({
  size: 20,
  expire: 10 * 60 // 10 minute cache
});

const getDefaultScript = (pixelCode) => {
  const snippet = `!function(f,b,e,v,n,t,s) \
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod? \
    n.callMethod.apply(n,arguments):n.queue.push(arguments)}; \
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0'; \
    n.queue=[];t=b.createElement(e);t.async=!0; \
    t.src=v;s=b.getElementsByTagName(e)[0]; \
    s.parentNode.insertBefore(t,s)}(window, document,'script', \
    'https://connect.facebook.net/en_US/fbevents.js'); \
    fbq('init', '${pixelCode}'); \
    fbq('track', 'PageView');`;
  return snippet;
};

const getConsentRequiredScript = (script, defaultDisable) => {
  const snippet = `var fpScript = "${script}"; \
      window.__RUN_ON_COOKIE_CONSENT__ = window.__RUN_ON_COOKIE_CONSENT__ || {}; \
      window.__RUN_ON_COOKIE_CONSENT__["${defaultDisable}"] = function () { \
        var s = document.createElement("script"); \
        s.id = "facebook-pixel-consent"; \
        s.innerText = fpScript; \
        document.getElementsByTagName("head")[0].appendChild(s); \
      }`;
  return snippet;
};

exports.responseProcessor = (req, res) => {
  if (req.mode !== 'live') {
    return res;
  }

  const site = libs.portal.getSite();

  const defaultDisable = app.name.replace(/\./g, "-") + "_disabled";

  if (site && site._path) {

    const { pixelCode, disableCookies } = siteConfigCache.get(`${req.branch}_${site._path}`, () => {
      const config = libs.portal.getSiteConfig() || {};
      config.disableCookies = forceArray(config.disableCookies);
      config.disableCookies.push({ name: defaultDisable, value: "true" });
      return config;
    });

    if (!pixelCode) {
      return res;
    }

    const cookies = req.cookies;
      if (res.cookies) {
        Object.keys(res.cookies).forEach((key) => {
          if (res.cookies[key].value) {
            cookies[key] = res.cookies[key].value;
          } else {
            cookies[key] = res.cookies[key];
          }
        });
      }

    let script = getDefaultScript(pixelCode);
    for (let cookieIndex = 0; cookieIndex < disableCookies.length; cookieIndex++) {
      const disableCookie = disableCookies[cookieIndex];

      // If disabled through cookie, add JavaScript for enabling later
      if (cookies[disableCookie.name] === disableCookie.value) {
        script = getConsentRequiredScript(script, defaultDisable);
        break;
      }
    }

    const snippet = `<script> ${script} </script> `;

    const noscriptSnippet = `
    <noscript> \
      <img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelCode}&ev=PageView&noscript=1"/> \
    </noscript> `;

    const headEnd = res.pageContributions.headEnd;
    if (!headEnd) {
      res.pageContributions.headEnd = [];
    }
    else if (typeof (headEnd) == 'string') {
      res.pageContributions.headEnd = [headEnd];
    }

    const bodyBegin = res.pageContributions.bodyBegin;
    if (!bodyBegin) {
      res.pageContributions.bodyBegin = [];
    }
    else if (typeof (bodyBegin) == 'string') {
      res.pageContributions.bodyBegin = [bodyBegin];
    }

    // Add contribution
    res.pageContributions.headEnd.push(snippet);
    res.pageContributions.bodyBegin.push(noscriptSnippet);

  }
  return res;
};
