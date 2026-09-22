namespace Managers.Interfaces;

public interface IStatisticsHandler : IDisposable
{
    public void StartStatistics();
    public void StopStatistics();
}