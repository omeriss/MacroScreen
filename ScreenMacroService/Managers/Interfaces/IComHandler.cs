using Common.Models;
using Common.Utils;

namespace Managers.Interfaces;

public interface IComHandler : IDisposable
{
    public void Start();
    public void Stop();
    public void SendCommand(Command command);
    public Command GetCommand();
    public bool WaitForAck(int id);
}