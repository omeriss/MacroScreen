namespace Common.Models;

public enum CommandType
{
    NoData,
    Acknowledge,
    Log,
    StartWriteFile,
    SendFilePart,
    Ls,
    LogFile,
    OpenProgram,
    StartStatistics,
    StopStatistics,
    SendStatistics,
    Boot
}