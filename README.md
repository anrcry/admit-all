# Fire Admit for Google <!-- omit in toc -->

## Table of Contents <!-- omit in toc -->

- [About the Plugin](#about-the-plugin)
- [How this works?](#how-this-works)
- [Disclaimer](#disclaimer)
- [Conclusion](#conclusion)

## About the Plugin

> TL;DR Solving Google Meet problem to "Admit All" particpants to take part in huge meetings, only forcing the host (or co-host \[Enterprise Accounts\]) to click (or tap) "Admit" multiple times (or "View All" at once & then "Admit All" \[PC Version only\]).

The 2020 Coronavirus Pandemic forced people to stay back home. We had to work, meet & socialize remotely. Thanks to popular video conferencing apps like [Google Meet](https://meet.google.com), [Zoom](https://zoom.us), [Microsoft Teams](https://teams.microsoft.com), [Skype](https://web.skype.com), [WhatsApp Video Call](https://whatsapp.com), [Messenger by Meta](https://messenger.com) and many more.

The leading players in the market were (and still are) Zoom and Google Meet. Zoom is extraoridinary with feature-rich interface, multi-platform apps, good video quality, Developer API, excellent dashboard. Google Meet (considering only the version handed out to regular `@gmail.com` accounts) lacks many features for the sole purpose of making it's interface simple & reach out to a larger low-tech audience.

One of the major features it lacks is skipping (or disabling) the break-out room. The feature is especially life-changing for a teacher who has no less than 40 children to allow access to the meeting. Zoom makes this fairly simple by either disabling the waiting room **(Not recommended ❎)** or clicking the "Admit All" button from the participants grid **(Recommended ✅)**. Google on the other hand, has a button to "View All" participants & then "Admit All".

## How this works?

The task here takes help of [**puppeteer**](https://pptr.dev). This is a very popular library and bundles Chromium helping us to sign-in, join the meeting and admit participants.
However I use **Puppeteer** with the `Stealth-Plugin`. This is very important as [Google won't let you sign in through an unsecure browser](https://support.google.com/accounts/ansIr/7675428?hl=en-GB).

Now I `sign in`, then go to `meet.google.com` and then type the `meeting code`. However, I do override the permissions for `microphone`, `camera` and `notifications`. After that we do press `ctrl + d` and `ctrl + e` to stop audio & video.

## Disclaimer

:warning: I must diclose you may violating the [terms of condition](https://policies.google.com/terms) & [privacy policy](https://policies.google.com/privacy). You should read it thoroughly before using.

## Conclusion

I hope this app helps many of you, especially teacher who need to click that admit button so many times.
