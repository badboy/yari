import { assert, itMacro, describeMacro } from "./utils";
import jsdom from "jsdom";

const locales = {
  "en-US": {
    About_MDN: "Community guidelines",
  },
  fr: {
    About_MDN: "Règles de la communauté",
  },
};

function checkSidebarDom(dom, locale) {
  const summaries = dom.querySelectorAll("summary");
  assert.equal(summaries[0].textContent, locales[locale].About_MDN);
}

describeMacro("MDNSidebar", function () {
  itMacro("Creates a sidebar object for en-US", function (macro) {
    macro.ctx.env.locale = "en-US";
    return macro.call().then(function (result) {
      const dom = jsdom.JSDOM.fragment(result);
      checkSidebarDom(dom, "en-US");
    });
  });

  itMacro("Creates a sidebar object for fr", function (macro) {
    macro.ctx.env.locale = "fr";
    return macro.call().then(function (result) {
      const dom = jsdom.JSDOM.fragment(result);
      checkSidebarDom(dom, "fr");
    });
  });
});
