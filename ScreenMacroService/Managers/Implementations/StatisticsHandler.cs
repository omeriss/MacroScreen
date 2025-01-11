using System.Diagnostics;
using System.Management;
using Common.Models;
using Common.Utils;
using LibreHardwareMonitor.Hardware;
using Managers.Interfaces;
using Microsoft.Diagnostics.Tracing.Session;

namespace Managers.Implementations;


public class StatisticsHandler : IStatisticsHandler
{
    private const int EventIdD3D9PresentStart = 1;
    private const int EventIdDxgiPresentStart = 42;
    
    private const int SleepTime = 1000;
    private const int QueryTime = 2000;
    private const int QueryTimeOut = 10000;
    private const int ControllingProcessTimeout = 5000;
        

    private static readonly Guid DxgiProvider = Guid.Parse("{CA11C036-0102-4A2D-A6AD-F03CFED5D3C9}");
    private static readonly Guid D3D9Provider = Guid.Parse("{783ACA0A-790E-4D7F-8451-AA850511C6B9}");

    private TraceEventSession? _traceSession;
    private readonly Dictionary<int, TimestampCollection> _frames = new Dictionary<int, TimestampCollection>();
    private Stopwatch? _watch = null;
    private readonly object _sync = new object();
    private Computer? _computer;

    private Thread? _thEtw;
    private Thread? _thOutput;
    private CancellationTokenSource? _cancellationTokenSource;

    private (KeyValuePair<int, TimestampCollection> process, long updated)? _controllingProcess = null;
    
    void EtwThreadProc()
    {
        _traceSession?.Source.Process();
    }
    
    static ProcessUsage? GetProcessWithMostGpuUsage( Dictionary<int, TimestampCollection> frames)
    {
        ProcessUsage? maxProcessUsage = null;
        
        foreach (var process in frames)
        {
            try
            {
                var memoryUsage = GetGpuMemoryUsage(process.Key);
                
                if (memoryUsage is not null)
                {
                    var currentGpuUsage = new ProcessUsage
                    {
                        Process = process,
                        GpuMemoryUsage = memoryUsage.Value
                    };

                    if (maxProcessUsage is null || currentGpuUsage.GpuMemoryUsage > maxProcessUsage.GpuMemoryUsage)
                        maxProcessUsage = currentGpuUsage;
                }
            }
            catch { }
        }

        return maxProcessUsage;
    }

    static float? GetGpuMemoryUsage(int pid)
    {
        try
        {
            var memoryCounter = new PerformanceCounterCategory("GPU Process Memory");
            
            foreach (var instance in memoryCounter.GetInstanceNames().Where(i => i.Contains($"pid_{pid}")))
            {
                var counter = new PerformanceCounter("GPU Process Memory", "Local Usage", instance);
                return counter.NextValue();
            }
        }
        catch { }
        
        return null;
    }
    
    public (float totalCpuUsage, float totalGpuUsage, float totalRamUsage) GetTotalUsage()
    {
        float totalCpuUsage = 0;
        float totalGpuUsage = 0;
        float totalRamUsage = 0;

        foreach (var hardwareItem in _computer?.Hardware ?? [])
        {
            hardwareItem.Update();

            foreach (var sensor in hardwareItem.Sensors)
            {
                if (hardwareItem.HardwareType == HardwareType.Cpu && sensor.SensorType == SensorType.Load &&
                    sensor.Name == "CPU Total")
                {
                    totalCpuUsage = sensor.Value.GetValueOrDefault();
                }
                else if ((hardwareItem.HardwareType == HardwareType.GpuNvidia ||
                          hardwareItem.HardwareType == HardwareType.GpuAmd) && sensor.SensorType == SensorType.Load &&
                         sensor.Name == "GPU Core")
                {
                    totalGpuUsage = sensor.Value.GetValueOrDefault();
                }
                else if (hardwareItem.HardwareType == HardwareType.Memory && sensor.SensorType == SensorType.Load &&
                         sensor.Name == "Memory")
                {
                    totalRamUsage = sensor.Value.GetValueOrDefault();
                }
            }
        }

        return (totalCpuUsage, totalGpuUsage, totalRamUsage);
    }

    void OutputThreadProc(CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            StatsInfo stats = new();
            bool processChanged = false;
            
            lock (_sync)
            {
                long currentTime = _watch!.ElapsedMilliseconds;
                
                foreach (var process in _frames)
                {
                    if (process.Value.GetOldest() < currentTime - QueryTimeOut)
                    {
                        _frames.Remove(process.Key);
                    }
                }

                if (_controllingProcess is null || _controllingProcess.Value.updated < currentTime - ControllingProcessTimeout ||
                    !_frames.ContainsKey(_controllingProcess.Value.process.Key))
                {
                    var maxProcess = GetProcessWithMostGpuUsage(_frames);

                    if (maxProcess is not null && maxProcess.Process.Key != _controllingProcess?.process.Key)
                    {
                        _controllingProcess = (maxProcess.Process, currentTime);
                        processChanged = true;
                    }
                    else 
                        _controllingProcess = null;
                }


                if (_controllingProcess is not null)
                {
                    int count = _controllingProcess.Value.process.Value.QueryCount(currentTime - QueryTime, currentTime);
                    stats.Fps = (ushort)((double)count / QueryTime * 1000.0);
                    stats.ProcessName = _controllingProcess.Value.process.Value.Name;
                }
            }
            
            var (totalCpuUsage, totalGpuUsage, totalRamUsage) = GetTotalUsage();
            
            stats.CpuUsage = (byte)totalCpuUsage;
            stats.GpuUsage = (byte)totalGpuUsage;
            stats.RamUsage = (byte)totalRamUsage;
            
            Command command = new(CommandType.SendStatistics);
            command.Write(stats.CpuUsage);
            command.Write(stats.RamUsage);
            command.Write(stats.GpuUsage);
            command.Write(stats.Fps);
            if (processChanged) command.WriteString(stats.ProcessName ?? "");

            try
            {
                Task.Delay(SleepTime, token).Wait(token);
            }
            catch (Exception)
            {
                break;
            }
        }
    }

    public void StartStatistics()
    {
        if (_computer is not null) return;
        
        _computer = new Computer
        {
            IsCpuEnabled = true,
            IsGpuEnabled = true,
            IsMemoryEnabled = true
        };
        _computer.Open();
        
        _traceSession = new TraceEventSession("mysess");
        _traceSession.StopOnDispose = true;
        _traceSession.EnableProvider("Microsoft-Windows-D3D9");
        _traceSession.EnableProvider("Microsoft-Windows-DXGI");

        //handle event
        _traceSession.Source.AllEvents += data =>
        {
            if (((int)data.ID != EventIdD3D9PresentStart || data.ProviderGuid != D3D9Provider) &&
                ((int)data.ID != EventIdDxgiPresentStart || data.ProviderGuid != DxgiProvider)) return;
            
            int pid = data.ProcessID;

            lock (_sync)
            {
                if (_watch is null) return;
                
                var t = _watch.ElapsedMilliseconds;

                if (!_frames.ContainsKey(pid))
                {
                    _frames[pid] = new TimestampCollection();
                    using var proc = Process.GetProcessById(pid);
                    _frames[pid].Name = proc.ProcessName;
                }

                _frames[pid].Add(t);
            }
        };

        lock (_sync)
        {
            _watch = new Stopwatch();
            _watch.Start();
        }

        _thEtw = new Thread(EtwThreadProc)
        {
            IsBackground = true
        };
        _thEtw.Start();

        _cancellationTokenSource = new CancellationTokenSource();
        _thOutput = new Thread(() => OutputThreadProc(_cancellationTokenSource.Token))
        {
            IsBackground = true
        };
        _thOutput.Start();
    }
    
    public void StopStatistics()
    {
        _traceSession?.Stop(true);
        _traceSession?.Dispose();
        
        
        _cancellationTokenSource?.Cancel();
        _cancellationTokenSource?.Dispose();
        
        _thEtw?.Join();
        _thOutput?.Join();
        
        lock (_sync)
        {
            _watch?.Stop();
            _watch = null;
        }
        _traceSession = null;
        _cancellationTokenSource = null;
        _thEtw = null;
        _thOutput = null;
        
        _computer?.Close();
        _computer = null;
        _controllingProcess = null;
    }
    
    public void Dispose()
    {
        StopStatistics();
    }
}