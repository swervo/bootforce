module.exports = function(grunt) {
	// * settings externalized; settings-user.json should NEVER BE IN THE REPO
	// * except for an example with non-working credentials
	var settings = {
		'project': require('./settings-project.json'),
		'user': require('./settings-user.json')
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// * Utility: Clean
		// *
		// * all: Trashes everything in build to get rid of stragglers
		// * tmp: trash .tmp folder after all work is done
		clean: {
			options: {
				force: true
			},
			all: ['build/**'],
			tmp: ['.tmp'],
			deploy: ['build/deploy'],
			deploy_zip: ['build/deploy/staticresources/*.zip']
		},

		// * HTML: Replace
		// *
		// * Modify CSS and JS loading to load minified versions
		replace: {
			dist: {
				options: {
					patterns: [
						{
							match: /\.js/g,
							replacement: '.min.js'
						}, {
							match: /\.css/g,
							replacement: '.min.css'
						}
					]
				},
				files: [
					{
						expand: true,
						flatten: true,
						src: ['build/dev/*.html'],
						dest: 'build/dist'
					}
				]
			}
		},

		// * Images: SVGMin
		// *
		// * Minify existing SVGs pre-grunticon
		svgmin: {
			options: {
				plugins: [
					{ removeUselessStrokeAndFill: true },
				]
			},
			dist: {
				files: [{
					expand: true,
					cwd: 'src/sass/img/sprites',
					src: ['**/*.svg'],
					dest: '.tmp/svgmin',
					ext: '.svg'
				}]
			}
		},

		// * Images: Grunticon
		// *
		// * Compile SVGs into a single Base64 encoded CSS file
		grunticon: {
			svg: {
				files: [{
					expand: true,
					cwd: '.tmp/svgmin',
					src: ['*.svg'],
					dest: '.tmp/grunticon'
				}],
				options: {
					datasvgcss: 'icons-svg.css'
				}
			}
		},

		// * CSS: SASS
		// *
		// * Compile SCSS files. Only compiling for dev with expanded style
		// * because running CSSMin on expanded CSS is faster than running
		// * SASS compile twice.
		sass: {
			dev: {
				options: {
					style: 'expanded'
				},
				files: {
					'build/dev/css/app.css': 'src/sass/app.scss',
					'build/dev/css/bootstrap-mod.css': 'src/sass/bootstrap-mod.scss'
				}
			}
		},

		// * CSS: CSSMin
		// *
		// * Minify CSS for dist
		cssmin: {
			dist: {
				files: {
					'build/dist/css/app.min.css': ['build/dev/css/app.css'],
					'build/dist/css/bootstrap-mod.min.css': ['build/dev/css/bootstrap-mod.css']
				}
			}
		},

		// * Utility: Copy
		copy: {
			sass_img_dev: {
				// * Copy images in SASS img folder into CSS img folder (dev)
				files: [{
					expand: true,
					cwd: 'src/sass/img/',
					src: ['**', '!sprites/**'],
					dest: 'build/dev/css/img'
				}]
			},
			sass_img_dist: {
				// * Copy images in SASS img folder into CSS img folder (dist)
				files: [{
					expand: true,
					cwd: 'src/sass/img/',
					src: ['**', '!sprites/**'],
					dest: 'build/dist/css/img'
				}]
			},
			sass_font_dev: {
				// * Copy fonts in SASS font folder into CSS font folder (dev)
				files: [{
					expand: true,
					cwd: 'src/sass/fonts/',
					src: ['**'],
					dest: 'build/dev/css/fonts'
				}]
			},
			sass_font_dist: {
				// * Copy fonts in SASS font folder into CSS font folder (dist)
				files: [{
					expand: true,
					cwd: 'src/sass/fonts/',
					src: ['**'],
					dest: 'build/dist/css/fonts'
				}]
			},
			grunticon_png: {
				files: [{
					expand: true,
					cwd: 'src/sass/img/sprites/',
					src: ['*.png'],
					dest: '.tmp/svgmin/'
				}]
			},
			grunticon_sass: {
				// * Copy Grunticon CSS file into a faux sprites SCSS file for
				// * SASS compilation
				files: [{
					expand: true,
					cwd: '.tmp/grunticon/',
					src: ['icons-svg.css'],
					dest: 'src/sass/',
					rename: function(dest, src) {
						return 'src/sass/app/sprites.scss';
					}
				}]
			},
			// * Copy js/views
			js_views_dev: {
				files: [{
					expand: true,
					cwd: 'src/js/views',
					src: ['**'],
					dest: 'build/dev/js/views'
				}]
			},
			js_views_dist: {
				files: [{
					expand: true,
					cwd: 'src/js/views',
					src: ['**'],
					dest: 'build/dist/js/views'
				}]
			},
			// * Copy partials
			partials_dev: {
				files: [{
					expand: true,
					cwd: 'src/templates/partials',
					src: ['**'],
					dest: 'build/dev/js/partials'
				}]
			},
			partials_dist: {
				files: [{
					expand: true,
					cwd: 'src/templates/partials',
					src: ['**'],
					dest: 'build/dist/js/partials'
				}]
			},
			// * Copy images in img folder into img folder
			img_dev: {
				files: [{
					expand: true,
					cwd: 'src/img/',
					src: ['**', '!sprites/**'],
					dest: 'build/dev/img'
				}]
			},
			img_dist: {
				files: [{
					expand: true,
					cwd: 'src/img/',
					src: ['**', '!sprites/**'],
					dest: 'build/dist/img'
				}]
			},
			// * Copy jquery (for CDN fallback) from bower
			jquery_dev: {
				files: [{
					expand: true,
					cwd: 'bower_components/jquery-legacy/dist/',
					src: ['jquery.js'],
					dest: 'build/dev/js/'
				}]
			},
			jquery_dist: {
				files: [{
					expand: true,
					cwd: 'bower_components/jquery-legacy/dist/',
					src: ['jquery.min.js'],
					dest: 'build/dist/js/'
				}]
			},
			jquery_migrate_dev: {
				files: [{
					expand: true,
					cwd: 'bower_components/jquery-migrate/',
					src: ['jquery-migrate.js'],
					dest: 'build/dev/js/'
				}]
			},
			jquery_migrate_dist: {
				files: [{
					expand: true,
					cwd: 'bower_components/jquery-migrate/',
					src: ['jquery-migrate.min.js'],
					dest: 'build/dist/js/'
				}]
			},
			deploy: {
				files: [{
					expand: true,
					cwd: 'build/deploy/staticresources/',
					src: ['*.zip'],
					dest: 'build/deploy/staticresources/',
					rename: function(dest, src) {
				        return dest + src.replace('.zip','.resource');
					}
				}]
			},
			mmDeploy: {
				files: [{
					expand: true,
					cwd: 'build/dev/css/',
					src: ['*.css'],
					dest: '../resource-bundles/PONO_Styles.resource/css/'
				},{
					expand: true,
					cwd: 'build/dist/css/',
					src: ['*.css'],
					dest: '../resource-bundles/PONO_Styles.resource/css/'
				}]
			},
			deployTest: {
				files: [{
					expand: true,
					cwd: 'src/js/views',
					src: ['*.js'],
					dest: 'build/deploy/staticresources/',
					rename: function(dest, src) {
				        return dest + 'THDP_view_' + src.replace('.js','.resource');
					}
				}]
			},
		},

		// * JS: Import
		// *
		// * Faux browserify 'import' function for JS
		// * TODO: See if there's a way to sourcemap
		import: {
			options: {},
			vendor_js: {
				src: 'src/js/vendor.js',
				dest: 'build/dev/js/vendor.js'
			},
			app_js: {
				src: 'src/js/app.js',
				dest: 'build/dev/js/app.js'
			}
		},

		// * JS: Uglify
		// *
		// * Minify JS for dist
		uglify: {
			options: {
			},
			app_js: {
				files: {
					'build/dist/js/app.min.js': ['build/dev/js/app.js']
				}
			},
			vendor_js: {
				files: {
					'build/dist/js/vendor.min.js': ['build/dev/js/vendor.js'],
				}
			}

		},

		// * Serve: Watch
		// *
		// * Watch files for changes and run corresponding tasks
		watch: {
			sass: {
				// * Recompile SASS files to dev and reminify to dist
				files: 'src/sass/**/*.scss',
				tasks: [
					'sass',
					'cssmin',
					'notify:watch_sass',
					'ifDeploying:styles',
					'mmDeployStyles'
				],
				options: {
					spawn: false,
			    },
			},

			sass_img: {
				// * Copy SASS images to dev and dist
				files: [
					'src/sass/img/**',
					'!src/sass/img/sprites/**'
				],
				tasks: [
					'copy:sass_img_dev',
					'copy:sass_img_dist',
					'notify:watch_sass_img',
					'ifDeploying:styles',
				],
				options: {
					spawn: false,
			    },
			},

			sass_sprites: {
				// * Sprites recompile, rebuild CSS, reminify
				files: 'src/sass/img/sprites/**',
				tasks: [
					'svgmin',
					'copy:grunticon_png',
					'grunticon',
					'copy:grunticon_sass',
					'clean:tmp',
					'sass',
					'cssmin',
					'notify:watch_sass_sprites',
					'ifDeploying:styles',
				],
				options: {
					spawn: false,
			    },
			},

			img: {
				// * Sprites recopy to dev and dist
				files: [
					'src/img/**',
					'!src/img/sprites/**'
				],
				tasks: [
					'copy:img_dev',
					'copy:img_dist',
					'notify:watch_img',
					'ifDeploying:images',
				],
				options: {
					spawn: false,
			    },
			},

			templates: {
				// * Templates recompile and run replace for dist
				// * TODO: figure out if this can be more granular
				files: ['src/templates/layouts/**', 'src/templates/pages/**'],
				tasks: [
					'replace',
					'notify:watch_templates'
				],
				options: {
					spawn: false,
			    },
			},

			partials: {
				// * Templates recompile and run replace for dist
				// * TODO: figure out if this can be more granular
				files: 'src/templates/partials/**',
				tasks: [
					'replace',
					'copy:partials_dev',
					'copy:partials_dist',
					'notify:watch_partials'
				],
				options: {
					spawn: false,
			    },
			},

			app_js: {
				// * app.js recompile for dev and reuglify for dist
				files: ['src/js/**', '!src/js/vendor'],
				tasks: [
					'import:app_js',
					'uglify:app_js',
					'copy:js_views_dev',
					'copy:js_views_dist',
					'notify:watch_app_js',
					'ifDeploying:scripts',
				],
				options: {
					spawn: false,
			    },
			},

			vendor_js: {
				// * vendor.js recompile for dev and reuglify for dist
				files: ['src/js/vendor.js'],
				tasks: [
					'import:vendor_js',
					'uglify:vendor_js',
					'notify:watch_vendor_js',
					'ifDeploying:vendor',
				],
				options: {
					spawn: false,
			    },
			}

		},

		// * Serve: Connect
		// *
		// * Host static site locally
		connect: {
			dev: {
				// * host unminified on port 5000
				options: {
					port: 5000,
					base: 'build/dev'
				}
			},
			dist: {
				// * host minified on port 5001
				options: {
					port: 5001,
					base: 'build/dist'
				}
			}
		},

		notify: {
			watch_sass: {
				options: {
					title: 'Watch: SASS',
					message: 'CSS rebuilt.'
				}
			},
			watch_sass_img: {
				options: {
					title: 'Watch: SASS images',
					message: 'SASS images copied.'
				}
			},
			watch_sass_sprites: {
				options: {
					title: 'Watch: SASS sprites',
					message: 'CSS rebuilt.'
				}
			},
			watch_img: {
				options: {
					title: 'Watch: Images',
					message: 'Images copied.'
				}
			},
			watch_templates: {
				options: {
					title: 'Watch: Templates & JSON',
					message: 'Templates rebuilt.'
				}
			},
			watch_partials: {
				options: {
					title: 'Watch: Partials',
					message: 'Templates rebuilt and partials copied.'
				}
			},
			watch_app_js: {
				options: {
					title: 'Watch: App.js',
					message: 'App.js rebuilt.'
				}
			},
			watch_vendor_js: {
				options: {
					title: 'Watch: Vendor.js',
					message: 'Vendor.js rebuilt.'
				}
			},
			first_run: {
				options: {
					title: 'Default',
					message: 'Initial tasks executed.'
				}
			},
			watch: {
				options: {
					title: 'Watch',
					message: 'Watch is running.'
				}
			},
			connect: {
				options: {
					title: 'Connect',
					message: 'Server is ready on port 5000 and 5001.'
				}
			},
			deploy: {
				options: {
					title: 'Deploy',
					message: 'Resource Bundles deployed to server.'
				}
			},
			mmDeploy: {
				options: {
					title: 'Ready for deployment',
					message: 'CSS copied to deployment location. Run Mavensmate:DeployResourceBundle to deploy to org.'
				}
			}
		},


		// * SFDC: Deploy
		// *
		// * Push to server via Ant

		compress: {
			// * Host static site locally
			styles: {
				options: {
					archive: 'build/deploy/staticresources/' + settings.project.prefix + '_Styles.zip'
				},
				files: [
					{
				 		expand: true,
				  		cwd: 'build/dev/css/',
				  		src: ['**'],
				  		dest: 'css/'
				  	},
				  	{
				  		expand: true,
				  		cwd: 'build/dist/css/',
				  		src: ['*.css'],
				  		dest: 'css/'
				  	},
				]
			},
			scripts: {
				options: {
					archive: 'build/deploy/staticresources/' + settings.project.prefix + '_Scripts.zip'
				},
				files: [
					{
				  		expand: true,
				  		cwd: 'build/dev/js/',
				  		src: ['app.*', 'views/**'],
				  		dest: 'js/'
				  	},
				  	{
				  		expand: true,
				  		cwd: 'build/dist/js/',
				  		src: ['app.*'],
				  		dest: 'js/'
				  	}
				]
			},
			vendor: {
				options: {
					archive: 'build/deploy/staticresources/' + settings.project.prefix + '_Vendor.zip'
				},
				files: [
					{
						expand: true,
						cwd: 'build/dev/js/',
						src: ['vendor.*'],
						dest: 'js/'
					},
					{
						expand: true,
						cwd: 'build/dist/js/',
						src: ['vendor.*'],
						dest: 'js/'
					},
				  	{
				  		expand: true,
				  		cwd: 'bower_components/jquery-legacy/dist/',
				  		src: ['*'],
				  		dest: 'js/'
				  	},
				  	{
				  		expand: true,
				  		cwd: 'bower_components/jquery-migrate/',
				  		src: ['*'],
				  		dest: 'js/'
				  	},
				  	{
				  		expand:true,
				  		cwd:'bower_components/qtip2/',
				  		src:['jquery.qtip_custom.min.js'],
				  		dest:'js/'
				  	}
				]
			},
			images: {
				options: {
					archive: 'build/deploy/staticresources/' + settings.project.prefix + '_Images.zip'
				},
				files: [
				 	{
				 		expand: true,
				 		cwd: 'build/dev/img/',
				 		src: ['**'],
				 		dest: 'img/'
				 	},
				]
			}
		},

		// * For our custom task, to generate -meta.xml files for each StaticResource we're building
		metadata: {
			deploy: {
				cwd: 'build/deploy/staticresources/',
				src: '*.resource'
			}
		},

		// * TEST
		metadataTest: {
			deploy: {
				cwd: 'build/deploy/staticresources/',
				src: '*.resource'
			}
		},

		// * push to server with Ant
		antdeploy: {
			options: {
				root: 'build/deploy/',
			},
			deploy: {
				options: {
					// * settings externalized; settings-user.json should NEVER BE IN THE REPO
					// * except for an example with non-working credentials
		        	user: settings.user.username,
		        	pass: settings.user.password,
		        	token: (settings.user.token)?settings.user.token:'',
		        	serverurl: settings.user.serverurl
				},
				pkg: {
					staticresource: ['*'],
				}
			},
		},

	});

	grunt.loadNpmTasks('grunt-svgmin');
	grunt.loadNpmTasks('grunt-grunticon');
	grunt.loadNpmTasks('grunt-replace');
	grunt.loadNpmTasks('grunt-import');
	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-ant-sfdc');
	// grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-rename');

	// * Custom task that generates -meta.xml files for each StaticResource we're building
	grunt.registerMultiTask('metadata', 'Write the required Salesforce metadata', function() {
		grunt.log.writeln('Writing metadata');
		var xml = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">',
			'	<cacheControl>Public</cacheControl>',
			'	<contentType>application/zip</contentType>',
			'	<description>Grunt generated FE resources</description>',
			'</StaticResource>'
		];
		this.files.forEach(function(fileGroup) {
			grunt.log.writeln('Processing ' + fileGroup.src.length + ' files.');
			fileGroup.src.forEach(function(file){
				grunt.file.write(fileGroup.cwd + file + '-meta.xml', xml.join('\n'));
				grunt.log.write('Writing file ' + fileGroup.cwd + file + '-meta.xml' + '...').ok();
			});
		});
	});

	grunt.registerMultiTask('metadataTest', 'Write the required Salesforce metadata', function() {
		grunt.log.writeln('Writing metadata');
		var xml = [
			'<?xml version="1.0" encoding="UTF-8"?>',
			'<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">',
			'	<cacheControl>Public</cacheControl>',
			'	<contentType>application/x-javascript</contentType>',
			'	<description>Grunt-published view JS</description>',
			'</StaticResource>'
		];
		this.files.forEach(function(fileGroup) {
			grunt.log.writeln('Processing ' + fileGroup.src.length + ' files.');
			fileGroup.src.forEach(function(file){
				grunt.file.write(fileGroup.cwd + file + '-meta.xml', xml.join('\n'));
				grunt.log.write('Writing file ' + fileGroup.cwd + file + '-meta.xml' + '...').ok();
			});
		});
	});

	// * Custom task that generates -meta.xml files for each StaticResource we're building
	grunt.registerTask('herokuFiles', 'Create files so that we can throw a static build on heroku', function() {
		grunt.log.writeln('Writing composer.json');
		grunt.file.write('build/dev/composer.json', '{}');
	});

	grunt.option('deployOnWatch', false);

	grunt.registerTask('setDeployOnWatch', 'Run watch with automatic deployment of all StaticResources', function() {
		grunt.log.writeln('Setting DeployOnWatch to true.');
		grunt.option('deployOnWatch', true);
	});

	grunt.registerTask('ifDeploying', 'Run deploy tasks if we want to deploy automatically', function() {
		grunt.log.writeln('deployOnWatch: ' + grunt.option('deployOnWatch'));
		for (var firstFlag in this.flags) break;

		if (grunt.option('deployOnWatch')) {
			// grunt.log.writeln('If this was done, we would be deploying ' + firstFlag + ' right now.');
			grunt.task.run('deploy' + firstFlag.charAt(0).toUpperCase() + firstFlag.slice(1));
		} else {
			grunt.log.writeln('Skipping deploy.');
		}
	});

	grunt.registerTask('default', [
		'clean:all',
		// HTML
		'replace',
		'herokuFiles',
		// Images
		'svgmin',
		'copy:grunticon_png',
		'grunticon',
		'copy:grunticon_sass',
		'clean:tmp',
		// CSS
		'sass',
		'cssmin',
		// JS
		'import',
		'uglify',
		// Finalize
		'copy',
		'notify:first_run',
		// Serve & Watch
		'connect',
		'notify:connect',
		'watch',
		'notify:watch',
	]);

	grunt.registerTask('justBuild', [
		'clean:all',
		// HTML
		'replace',
		'herokuFiles',
		// Images
		'svgmin',
		'copy:grunticon_png',
		'grunticon',
		'copy:grunticon_sass',
		'clean:tmp',
		// CSS
		'sass',
		'cssmin',
		// JS
		'import',
		'uglify',
		// Finalize
		'copy',
		'notify:first_run'
	]);

	// * same as watch but automatically deploys bundles to force.com
	grunt.registerTask('watchDeploy', [
		'setDeployOnWatch',
		'default',
	]);

	// * manual task to deploy ALL bundles
	grunt.registerTask('deployAll', [
		'clean:deploy',
		'compress',
		'copy:deploy',
		'clean:deploy_zip',
		'metadata',
		'antdeploy:deploy',
		'notify:deploy',
	]);

	// * manual task to deploy ONLY the Styles bundle
	grunt.registerTask('deployStyles', [
		'clean:deploy',
		'compress:styles',
		'copy:deploy',
		'clean:deploy_zip',
		'metadata',
		'antdeploy:deploy',
		'notify:deploy',
	]);

	// * manual task to deploy ONLY the Styles bundle
	grunt.registerTask('mmDeployStyles', [
		'compress:styles',
		'copy:mmDeploy',
		'notify:mmDeploy',
	]);
	// * manual task to deploy ONLY the Images bundle
	grunt.registerTask('deployImages', [
		'clean:deploy',
		'compress:images',
		'copy:deploy',
		'clean:deploy_zip',
		'metadata',
		'antdeploy:deploy',
		'notify:deploy',
	]);

	// * manual task to deploy ONLY the Scripts bundle
	grunt.registerTask('deployScripts', [
		'clean:deploy',
		'compress:scripts',
		'copy:deploy',
		'clean:deploy_zip',
		'metadata',
		'antdeploy:deploy',
		'notify:deploy',
	]);
	// * manual task to deploy ONLY the Vendor Scripts bundle
	grunt.registerTask('deployVendor', [
		'clean:deploy',
		'compress:vendor',
		'copy:deploy',
		'clean:deploy_zip',
		'metadata',
		'antdeploy:deploy',
		'notify:deploy',
	]);
};
