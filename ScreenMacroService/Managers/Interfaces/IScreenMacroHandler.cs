using Common.Models.Settings;

namespace Managers.Interfaces;

public interface IScreenMacroHandler : IDisposable
{
    public void ExecuteCommand();
    public void Start(bool retry = true);
    public bool UploadCode(UploadConfig config);
}