using Managers;
using ScreenMacroService;

var builder = Host.CreateApplicationBuilder(args);

// builder.Services.AddWindowsService(options =>
// {
//     options.ServiceName = "ScreenMacro";
// });

builder.Services.AddManagers().AddHostedService<Worker>();

var host = builder.Build();
host.Run();