const application = require('./dist');

// Run the application
application.main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
});
