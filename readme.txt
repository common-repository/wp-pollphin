=== Pollphin for Wordpress ===
Contributors: mscheland
Author: Pollphin GmbH
Author URI: http://www.pollphin.de
Tags: pollphin, polls, poll, voting, post, page, embed, plugin, survey, feedback
Requires at least: 3.0
Tested up to: 3.5.1
Stable tag: 0.9

Embed Pollphin polls without modifying your template code on every post or page to easily enable a user feedback opportunity!

== Description ==
**Update Notices**

The "own style" feature works "update save" now. Goto the FAQ section to find out, how to migrate you current pollphin style to the new feature.
No worries - it's done in less than 5min.

**About Pollphin**

Are you interested in other people's opinions on current and hot topics? 
Want to know what other people think? 
Do you enjoy it to say your own opinion? 
Ever wanted to start own polls? 
Pollphin is right for you! It offers tons of polls for everyone! 
Here you are able to participate in polls on a variety of exciting topics. Just with a single click and without registration.

If you want more Pollphin, please register: Now you are able create your own polls and invite your friends to participate. 
You are able comment on your vote and vote on polls for registered users only. 
On request, we will inform you about poll results and other news on www.pollphin.de. 

**Plugin Information**

This plugin enables your WordPress installation to embed Pollphin polls on each post or page without modifying your template code. 
The poll will be displayed right after the post/page. It is loaded via AJAX and brings his own stylesheet. 
To create an own poll you need to register at www.pollphin.de - no worries it's free!
Polls are hosted and can be accessed via the www.pollphin.de community - this increases the visibility of you polls immediately!

**Features**

* Easily embed public polls from www.pollphin.de in your WordPress blog
* Create and choose the style of each poll to embed. 100% and 50% width style included.

More features are coming soon - stay tuned and give us feedback to support the development! Meanwhile check out the site www.pollphin.de.

== Installation ==

1. Download the wp-pollphin zip file. From your WordPress dashboard->Plugins->Add new->Upload, choose the wp-pollphin zip file, Press "Install now".
2. Or from your dashboard go to Plugins->Add new->Search for "Pollphin", and press Install now.
3. To activate the plugin, go to Plugins and press Activate under the Pollphin plugin.
4. Open any post or page to edit.
5. Enter the poll ID copied from www.pollhpin.de. E.g. http://www.pollphin.de/poll/Hamburg/this-is-the-poll-title-3771180 the poll ID is "3771180"
6. Save changes.

== Frequently Asked Questions ==

= Do I have to register on www.pollphin.de in order to use the plugin? =

No. But if you want to create own polls you need to register.

= Is it all free? =

Sure is.

= I've entered a poll ID but nothing is showing up. =

Please make sure you selected a public poll - private and registered only polls will come soon!

= Will there be more awesome features coming up? =

Definitely - give us feedback to support the development.

= Is it possible to embed private or registered only polls? =

No not yet - we are working on this feature. 

= How to create my own style? =

Just copy the "default.css" and the "img-default" files from the "styles" folder into your theme and rename the CSS file to "pollphin.css"
Now edit the style as you like. The activation will be automatically.

= How to set my own style as default? =

If no own Theme-based style is created: Goto the Admin-Settings-Menu "Pollphin", select your style from the dropdown menu and update the settings. Now the style is active for all polls.
If there is a Theme-based style named "pollphin.css" inside your theme folder, this one will automatically been chosen.

== Screenshots ==

1. The admin interface
2. Showing an embedded poll
3. Public polls showing the button "einbetten" will work
4. Remember these settings when creating a public poll

== Changelog ==

= 0.9 =
* working with latest WordPress version

= 0.8.1 =
* small css clearfix

= 0.8 =
* all your created themes are now update save! just copy your own style to your theme - wp-pollphin will find it!

= 0.7 =
* new feature showing pictures in embedding-view implemented. more infos: http://bit.ly/FS8K1A
* code cleanup
* small fixes
* latest WP-version approvement

= 0.6.2 =
* WP-3.3 compability checked

= 0.6.1 =
* backlink for non JS
* local JS-Script

= 0.6 =
* admin: switch to show the poll right after the excerpt (will effect the frontpage)

= 0.5 =
* admin: style chooser on pages/posts has been removed
* admin: global settings page has been added to define the default style
* clean and small style added by default
* is_front_page() replaced by is_page() and is_single() to support the "static frontpage" setting
* uninstallation includes options & post_meta data (even old data from previous versions)

= 0.4 =
* fixed problems with default theme 
* compability check with WordPress 3.2

= 0.3.5 =
* preview bug not saving empty poll id (removed poll)

= 0.3 =
* embedding upgrades to latest Pollphin version
* style renamed & FAQ to create and set own style as default

= 0.2.1 =
* workaround for style saving problems
* optimized the load of Pollphin JS

= 0.2 =
* better hash-tag
* style chooser
* 100% and 50% width style included
* more generic code

= 0.1.1 =
* hash fix & more project infos

= 0.1 =
* first public release
