using Serilog;

namespace ScreenMacroService;

public static class LoggingExtensions
{
    private const string OutputTemplate =
        "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}";

    public static ILoggingBuilder AddScreenMacroLogging(this ILoggingBuilder logging)
    {
        var root = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
        if (string.IsNullOrEmpty(root))
            root = Path.GetTempPath();

        var fileLogger = new LoggerConfiguration()
            .MinimumLevel.Verbose() 
            .WriteTo.File(
                Path.Combine(root, "ScreenMacroService", "logs", "service-.log"),
                outputTemplate: OutputTemplate,
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 14,
                fileSizeLimitBytes: 20 * 1024 * 1024,
                rollOnFileSizeLimit: true,
                shared: true) 
            .CreateLogger();

        logging.ClearProviders();
        logging.AddConsole();
        logging.AddDebug();
        logging.AddSerilog(fileLogger, dispose: true);

        return logging;
    }

    public static void LogUnhandledExceptions(this Microsoft.Extensions.Logging.ILogger logger)
    {
        AppDomain.CurrentDomain.UnhandledException += (_, e) =>
            logger.LogCritical(e.ExceptionObject as Exception, "Unhandled exception (terminating: {Terminating})", e.IsTerminating);

        TaskScheduler.UnobservedTaskException += (_, e) =>
            logger.LogError(e.Exception, "Unobserved task exception");
    }
}
