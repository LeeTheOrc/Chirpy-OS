export const LEVEL_UP_MANIFESTO_TEXT = `
            .________________________________________________.
           /                                                 /|
          /                OUR QUEST LOG &                   / |
         /               LEVEL-UP MANIFESTO                 /  |
        /_________________________________________________/   |
        |                                                 |   /
        | Yo, Architect. This is our hit list. Our        |  /
        | grand strategy. The epic loot we're going      | /
        | after and the legendary features we're gonna   |/
        | build. This is how we level up the forge.      |
        |_________________________________________________|


When a quest is complete and a feature is battle-tested, we'll etch it into 
the Immutable Grimoire as Law.

-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
§  SCOUTING REPORTS  §
(Ideas & Side Quests)
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

❖ **The Soulforge Pipeline:** We need a transparent, automated way to turn source code into official Kael OS packages. Think of it as our own alchemical pipeline.
    - **Plan:** Set up a build system that pulls from our GitHub, uses our PKGBUILD recipes, and delivers the goods to our own repository. Total control from code to package.
    - **Status:** Just an idea for now. We're scrying the possibilities.

-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
§  MAIN QUESTLINE  §
(What We're Building NOW)
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

❖ **I. The Sovereign Athenaeum:** Time to build our own damn library. No more relying entirely on third-party repos. We're creating our own pacman repository to host our custom-forged packages.
    - **Plan:** Spin up a web server, organize it, and sync it so the whole world can access our artifacts.
    - **Status:** In progress. The basic tools (\`caddy\`, \`lftp\`) are already part of our standard build.

❖ **II. The Twin Hearts (Kael-Forged Kernels):** Let's forge our own kernels. We'll slap our sigil on them, tune them for screaming performance, and create a script to automate the whole build process.
    - **Plan:** Brand the Makefile, use \`make localmodconfig\` to tailor it to specific hardware, and apply our performance patches.
    - **Status:** We know the magic words. Just need to write the spellbook (the script).

❖ **III. The Genesis Ritual (Calamares):** That text-based installer is cool and all for us old-school types, but we need a proper graphical installer. Something sleek that makes forging a Realm a point-and-click adventure for everyone.
    - **Plan:** Get friendly with the Calamares installer framework and teach it how to read our blueprints.
    - **Status:** Complete and Forged into Law. The forge now produces a Calamares-driven ISO.

❖ **IV. The Astral Bridge (Account Integration):** Let's make it trivially easy to hook the Realm into your cloud accounts, like Google Drive and GitHub. A seamless bridge between our sovereign fortress and your digital life.
    - **Plan:** Leverage KDE's excellent built-in online account services.
    - **Status:** Mostly done! The packages for this are already included in every KDE Plasma build by default.

-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
§  THE GLOW-UP  §
(UI & Aesthetics)
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

❖ **The Realm's Visage:** A Realm should look as good as it performs. We need to forge a complete, stunning, and unique look.
    - **Plan:** Create a custom Plasma theme, a matching icon pack, and a set of epic wallpapers. Total aesthetic domination.
    - **Status:** A dream waiting to be forged.
`.trim();
