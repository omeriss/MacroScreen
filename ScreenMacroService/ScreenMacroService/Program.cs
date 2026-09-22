using System.Reflection;
using Common.Models.Settings;
using Managers;
using ScreenMacroService;


const string uploadCommand = "upload";

var builder = Host.CreateApplicationBuilder(args);

builder.Logging.AddScreenMacroLogging();

builder.Configuration.SetBasePath(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

builder.Services.AddManagers();

if (args.Length > 0 && args[0] == uploadCommand)
{
    string? path = args.Length > 1 ? args[1] : null;

    if (path is not null)
    {
        builder.Services.AddSingleton(new UploadConfig() { UploadPath = path });
        builder.Services.AddSingleton<Uploader>();
    }

    var services = builder.Services.BuildServiceProvider();
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogUnhandledExceptions();

    if (path is null)
    {
        logger.LogError("No path provided for upload command.");
        return;
    }

    logger.LogInformation("Uploading from {Path}", path);

    services.GetRequiredService<Uploader>().Execute();
}
else
{
    builder.Services.AddHostedService<Worker>();

    var host = builder.Build();
    host.Services.GetRequiredService<ILogger<Program>>().LogUnhandledExceptions();

    host.Run();
}
