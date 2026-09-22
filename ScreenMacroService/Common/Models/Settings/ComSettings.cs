namespace Common.Models.Settings;

public class ComSettings
{
    public required int Pid { get; set; }
    public required int Vid { get; set; }
    public required int BaudRate { get; set; }
    public required int ReadTimeout { get; set; }
    public required int AckTimeout { get; set; }
}

