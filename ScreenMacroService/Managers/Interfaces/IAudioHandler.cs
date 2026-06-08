using Common.Utils;

namespace Managers.Interfaces;

public interface IAudioHandler : IDisposable
{
    public Task Start();
    public void Stop();
    public Task AudioAction(Command command);
}