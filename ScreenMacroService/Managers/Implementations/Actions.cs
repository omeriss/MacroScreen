using System.Diagnostics;
using System.Text;
using Common.Attributes;
using Common.Models;
using Common.Utils;
using Managers.Interfaces;

namespace Managers.Implementations;

public class Actions(IStatisticsHandler statisticsHandler) : IActions
{
    private IStatisticsHandler _statisticsHandler = statisticsHandler;

    [CommandHandler(CommandType.Log)]
    public void Log(Command command)
    {
        Console.WriteLine(Encoding.UTF8.GetString(command.Payload));
    }
    
    [CommandHandler(CommandType.OpenProgram)]
    public void OpenProgram(Command command)
    {
        var path = Encoding.UTF8.GetString(command.Payload);
        Process.Start(path);
    }
    
    [CommandHandler(CommandType.StartStatistics)]
    public void StartStatistics(Command command)
    {
        _statisticsHandler.StartStatistics();
    }
    
    [CommandHandler(CommandType.StopStatistics)]
    public void StopStatistics(Command command)
    {
        _statisticsHandler.StopStatistics();
    }
    
    public void Dispose()
    {
        _statisticsHandler.Dispose();
    }
}