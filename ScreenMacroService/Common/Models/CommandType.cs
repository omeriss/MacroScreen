namespace Common.Models;

public enum CommandType
{
    NoData,
    Acknowledge,
    Log,
    OpenProgram,
    StartStatistics,
    StopStatistics,
    SendStatistics
}