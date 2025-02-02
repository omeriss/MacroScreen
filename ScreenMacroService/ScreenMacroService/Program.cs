using Common.Models.Settings;
using Managers;
using ScreenMacroService;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddManagers();

const string uploadCommand = "upload";

if (args.Length > 0 && args[0] == uploadCommand)
{
    string? path = args.Length > 1 ? args[1] : null;
    
    if (path is null)
    {
        Console.Error.WriteLine("No path provided for upload command.");
        return;
    }
    
    builder.Services.AddSingleton(new UploadConfig() { UploadPath = path });
    builder.Services.AddHostedService<Uploader>();
}
else
{
    builder.Services.AddHostedService<Worker>();
}

var host = builder.Build();
host.Run();