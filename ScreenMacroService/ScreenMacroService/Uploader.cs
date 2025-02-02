using Common.Models.Settings;
using Managers.Interfaces;

namespace ScreenMacroService;

public class Uploader(ILogger<Worker> logger, IScreenMacroHandler screenMacroHandler, UploadConfig uploadConfig)
    : BackgroundService
{
    private readonly ILogger<Worker> _logger = logger;
    private readonly UploadConfig _uploadConfig = uploadConfig;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        screenMacroHandler.Start();
        screenMacroHandler.UploadCode(_uploadConfig);
    }
    
    public override void Dispose()
    {
        screenMacroHandler.Dispose();
        base.Dispose();
    }    
}
