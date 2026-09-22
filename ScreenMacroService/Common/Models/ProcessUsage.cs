using Common.Utils;

namespace Common.Models;

public class ProcessUsage
{
    public KeyValuePair<int, TimestampCollection> Process { get; set; }
    public float GpuMemoryUsage { get; set; }
}
