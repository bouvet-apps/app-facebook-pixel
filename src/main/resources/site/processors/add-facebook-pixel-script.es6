const libs = {
  freemarker: require("/site/lib/tineikt/freemarker"),
  portal: require('/lib/xp/portal')
};

const view = resolve("facebook-pixel-script.ftl");

exports.responseProcessor = (req, res) => {
	const siteConfig = libs.portal.getSiteConfig();

	// If no pixel code added to app, send null so that no script will be generated.
	const pixelCode = (siteConfig && siteConfig.pixelCode) ?  siteConfig.pixelCode : null;
	const script = libs.freemarker.render(view, { pixelCode });

	const headEnd = res.pageContributions.headEnd;
    if (!headEnd) {
    	res.pageContributions.headEnd = [];
    }

    // Add contribution
	res.pageContributions.headEnd.push(script);
	
	return res;
};