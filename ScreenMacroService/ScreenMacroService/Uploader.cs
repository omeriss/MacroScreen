using Common.Models.Settings;
using Managers.Interfaces;

namespace ScreenMacroService;

public class Uploader(ILogger<Worker> logger, IScreenMacroHandler screenMacroHandler, UploadConfig uploadConfig) 
{
    private readonly ILogger<Worker> _logger = logger;
    private readonly UploadConfig _uploadConfig = uploadConfig;

    public void Execute()
    {
        screenMacroHandler.Start();
        screenMacroHandler.UploadCode(_uploadConfig);
        screenMacroHandler.Dispose();
    }
}
