
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

module.exports = (app) => {
    Sentry.init({
        dsn: "https://531b6bd6b03a285334ec48efccafca75@o4506627202809856.ingest.sentry.io/4506627213950976",
        integrations: [
            new Sentry.Integrations.Http({ tracing: true }),   // enable HTTP calls tracing
            new Sentry.Integrations.Express({ app }),          // enable Express.js middleware tracing
            new ProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0,    //  Capture 100% of the transactions
        profilesSampleRate: 1.0,  // Set sampling rate for profiling - this is relative to tracesSampleRate
    });
    return Sentry;
};
