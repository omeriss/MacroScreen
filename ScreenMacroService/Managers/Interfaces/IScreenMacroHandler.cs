namespace Managers.Interfaces;

public interface IScreenMacroHandler : IDisposable
{
    public void ExecuteCommand();
    public void Start(bool retry = true);
}