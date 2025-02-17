namespace Common.Models;

public enum CommandType
{
    NoData,
    Acknowledge,
    Log,
    StartWriteFile,
    SendFilePart,
    Ls,
    MkDir,
    RmDir,
    LogFile,
    OpenProgram,
    StartStatistics,
    StopStatistics,
    SendStatistics,
    StartAudio,
    StopAudio,
    SendAudio,
    AudioAction,
    Boot,
}