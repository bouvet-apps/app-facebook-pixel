# Facebook Pixel for Enonic XP

An Enonic XP 8 application that adds the Meta (formerly Facebook) Pixel to a
site. Configure the site's Facebook Pixel ID and the app generates the browser
script that initializes the Pixel and tracks page views.

## What it does

- Adds the Pixel script to live site responses when a Pixel ID is configured.
- Loads Meta's `fbevents.js`, initializes it with the configured ID, and calls
	`fbq('track', 'PageView')`.
- Registers a callback in `window.__RUN_ON_COOKIE_CONSENT__` for a cookie-consent
	integration to invoke.

The app does not check cookies or decide whether consent has been granted. A
cookie-consent solution must invoke the registered callback at the appropriate
time. Make sure the site's consent setup and privacy notices meet the
requirements that apply to your site before enabling the Pixel.

## Install and configure

1. Install the application on your Enonic XP 8 instance.
2. Add **Facebook Pixel** to the site in Content Studio.
3. Configure the site's **Facebook Pixel ID** field with the Pixel ID from
	 Meta Events Manager.
4. Publish the site. The script is added to live responses; it is not added in
	 edit or preview mode.

If the Pixel ID is empty, the app does not add a script.

## Cookie-consent integration

The app registers its callback at:

```js
window.__RUN_ON_COOKIE_CONSENT__["no-bouvet-app-facebookpixel_disabled"]
```

The key is derived from the application name (`no.bouvet.app.facebookpixel`)
by replacing dots with hyphens and appending `_disabled`. The callback inserts
the Pixel initialization script into the page. The consent integration is
responsible for calling it only when permitted; the callback is not invoked
automatically by this app.

## Build

This project targets Enonic XP 8.0.3. Build the application JAR with the Gradle
wrapper:

```sh
./gradlew build
```

The packaged application is written to `build/libs/`.