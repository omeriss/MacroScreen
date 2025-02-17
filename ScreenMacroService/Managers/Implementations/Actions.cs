using System.Diagnostics;
using System.Text;
using Common.Attributes;
using Common.Models;
using Common.Utils;
using Managers.Interfaces;

namespace Managers.Implementations;

public class Actions(IStatisticsHandler statisticsHandler, IAudioHandler audioHandler) : IActions
{
    private readonly IStatisticsHandler _statisticsHandler = statisticsHandler;
    private readonly IAudioHandler _audioHandler = audioHandler;

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
    
    [CommandHandler(CommandType.StartAudio)]
    public void StartAudio(Command command)
    {
        _audioHandler.Start();
    }
    
    [CommandHandler(CommandType.StopAudio)]
    public void StopAudio(Command command)
    {
        _audioHandler.Stop();
    }
    
    [CommandHandler(CommandType.AudioAction)]
    public void AudioAction(Command command)
    {
        _audioHandler.AudioAction(command);
    }
    
    public void Dispose()
    {
        _statisticsHandler.Dispose();
        _audioHandler.Dispose();
    }
}