using System.Reflection;
using Common.Models.Settings;
using Managers;
using ScreenMacroService;


var builder = Host.CreateApplicationBuilder(args);

builder.Configuration.SetBasePath(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!)
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

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
    
    Console.WriteLine($"Uploading from {path}");
    
    builder.Services.AddSingleton(new UploadConfig() { UploadPath = path });
    builder.Services.AddSingleton<Uploader>();
    
    var uploader = builder.Services.BuildServiceProvider().GetRequiredService<Uploader>();
    uploader.Execute();
}
else
{
    builder.Services.AddHostedService<Worker>();
    
    var host = builder.Build();
    host.Run();
}