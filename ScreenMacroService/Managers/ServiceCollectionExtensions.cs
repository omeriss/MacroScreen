using Managers.Implementations;
using Managers.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace Managers;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddManagers(this IServiceCollection services)
    {
        services.AddSingleton<IComHandler, ComHandler>();
        services.AddSingleton<IScreenMacroHandler, ScreenMacroHandler>();
        services.AddSingleton<IActions, Actions>();
        services.AddSingleton<IStatisticsHandler, StatisticsHandler>();
        services.AddSingleton<IFileManager, FileManager>();
        
        return services;
    }
}