namespace Common.Models;

public struct StatsInfo(byte cpuUsage, byte ramUsage, byte gpuUsage, ushort fps)
{
    public byte CpuUsage = cpuUsage;
    public byte RamUsage = ramUsage;
    public byte GpuUsage = gpuUsage;
    public ushort Fps = fps;
    public string? ProcessName { get; set; }

    public StatsInfo() : this(0, 0, 0, 0)
    {
    }
}