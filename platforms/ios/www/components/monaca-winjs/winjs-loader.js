(function() {
    if (!window.WinJS || !window.WinJS.UI) {
        var scriptElemWinJS = document.createElement("script");
        scriptElemWinJS.src = "//Microsoft.WinJS.1.0/js/base.js";
        document.head.appendChild(scriptElemWinJS);

        var scriptElemWinJSUI = document.createElement("script");
        scriptElemWinJSUI.src = "//Microsoft.WinJS.1.0/js/ui.js";
        document.head.appendChild(scriptElemWinJSUI);
    }
})();
