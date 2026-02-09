const libs = {
  portal: require("/lib/xp/portal")
};

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
    const siteConfig = libs.portal.getSiteConfig() || {};
    const pixelCode = siteConfig.pixelCode || "";

    if (!pixelCode) {
      return res;
    }

    let script = getDefaultScript(pixelCode);
    script = getConsentRequiredScript(script, defaultDisable);

    const snippet = `<!-- Facebook pixel --> \
      <script> ${script} </script> \
    <!-- End Facebook pixel -->`;

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

  }
  return res;
};
