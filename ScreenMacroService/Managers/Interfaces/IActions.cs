using Common.Models;
using Common.Utils;

namespace Managers.Interfaces;

public interface IActions : IDisposable
{
    public void Log(Command command);
    public void OpenProgram(Command command);
    public void StartStatistics(Command command);
    public void StopStatistics(Command command);
}