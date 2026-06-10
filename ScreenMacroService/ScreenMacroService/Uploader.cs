using Common.Models.Settings;
using Managers.Interfaces;

namespace ScreenMacroService;

public class Uploader(ILogger<Uploader> logger, IScreenMacroHandler screenMacroHandler, UploadConfig uploadConfig)
{
    private readonly ILogger<Uploader> _logger = logger;
    private readonly UploadConfig _uploadConfig = uploadConfig;

    public void Execute()
    {
        screenMacroHandler.Start(false);
        var success = screenMacroHandler.UploadCode(_uploadConfig);
        screenMacroHandler.Dispose();

        if (success)
            _logger.LogInformation("Upload from {Path} finished", _uploadConfig.UploadPath);
        else
            _logger.LogError("Upload from {Path} did not complete (device did not acknowledge)", _uploadConfig.UploadPath);
    }
}
