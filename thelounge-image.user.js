// ==UserScript==
// @name         The Lounge - Inline Image Preview
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Replace image URLs in chat with inline previews through wsrv.nl
// @author       NeoByte
// @match        *://your-thelounge-domain.com/*
// @icon         https://thelounge.chat/favicon.ico
// @run-at       document-end
// ==/UserScript==

(() => {
    const IMG_EXT = /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i;

    function cdn(url) {
        return `https://wsrv.nl/?w=500&h=200&url=${encodeURIComponent(url)}`;
    }

    function wrapElement(wrapperTag, element) {
        const wrapper = document.createElement(wrapperTag);
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
        return wrapper;
    }

    function convertLink(a) {
        const url = a.href;

        // Skip already-converted links
        if (a.querySelector("img")) return;

        if (IMG_EXT.test(url)) {
            const span = wrapElement("span", a);
            span.style.display = "block";

            const img = document.createElement("img");
            img.src = cdn(url);
            img.style.maxWidth = "500px";
            img.style.maxHeight = "200px";
            img.style.borderRadius = "6px";
            img.style.marginTop = "4px";

            // Replace text inside <a> with our <img>
            a.textContent = "";
            a.appendChild(img);
        }
    }

    // Process all existing messages
    function processAll() {
        document.querySelectorAll("a").forEach(convertLink);
    }

    // Observe dynamic message creation (The Lounge loads messages live)
    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType === 1) {
                    // If it's a message row, check inside it
                    node.querySelectorAll?.("a").forEach(convertLink);

                    // If it's directly an <a>, convert it
                    if (node.tagName === "A") {
                        convertLink(node);
                    }
                }
            }
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Initial run
    processAll();
})();
