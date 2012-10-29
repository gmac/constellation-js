({
    appDir: "../",
    baseUrl: "js",
    dir: "../../dist",
	optimize: "uglify",
	optimizeCss: "standard",
	exclude: [
		"r.js",
		"js/app.build.js"
	],
	fileExclusionRegExp: /^test$|[-]?test[-]?|^r.js$|^app.build.js$/,
    modules: [
        {
            name: "main"
        }
    ]
})