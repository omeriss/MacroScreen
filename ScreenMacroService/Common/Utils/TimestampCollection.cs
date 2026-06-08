namespace Common.Utils;

public class TimestampCollection
{
    const int MaxValues = 1000;

    public string? Name { get; set; }
    
    private readonly List<long> _timestamps = new List<long>(MaxValues);
    private readonly object _sync = new object();

    public void Add(long timestamp)
    {
        lock (_sync)
        {
            if (_timestamps.Count >= MaxValues) _timestamps.RemoveAt(0);
            _timestamps.Add(timestamp);
        }
    }

    public int QueryCount(long from, long to)
    {
        int c = 0;

        lock (_sync)
        {
            foreach (var ts in _timestamps)
            {
                if (ts >= from && ts <= to) c++;
            }
        }
        
        return c;
    }
    
    public long GetOldest()
    {
        lock (_sync)
        {
            return _timestamps.Count > 0 ? _timestamps[0] : 0;
        }
    }
}