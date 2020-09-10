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

exports.responseProcessor = (req, res) => {
  const site = libs.portal.getSite();

  if (site && site._path) {

    const { pixelCode, disableCookies } = siteConfigCache.get(`${req.branch}_${site._path}`, () => {
      const config = libs.portal.getSiteConfig() || {};
      config.disableCookies = forceArray(config.disableCookies);
      config.disableCookies.push({ name: `${app.name.replace(/\./g, "-")}_disabled`, value: "true" });
      return config;
    });

    if (pixelCode) {
      let render = true;

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

      for (let i = 0; i < disableCookies.length; i++) {
        const disableCookie = disableCookies[i];

        if (cookies[disableCookie.name] === disableCookie.value) {
          render = false;
          break;
        }
      }

      if (render) {
        const script = `
          <!-- Facebook Pixel Code -->
          <script>
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelCode}');
          fbq('track', 'PageView');
          </script>
          <noscript>
          <img height="1" width="1" style="display:none"
              src="https://www.facebook.com/tr?id=${pixelCode}&ev=PageView&noscript=1"/>
          </noscript>
          <!-- End Facebook Pixel Code -->
        `;

        const headEnd = res.pageContributions.headEnd;
        if (!headEnd) {
          res.pageContributions.headEnd = [];
        }

        // Add contribution
        res.pageContributions.headEnd.push(script);
      }
    }
  }
  return res;
};
