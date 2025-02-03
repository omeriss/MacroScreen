using System;
using System.IO.Ports;
using System.Linq;
using System.Management;
using System.Text;
using LibUsbDotNet;
using System.Threading;
using Common.Models;
using Managers.Interfaces;

namespace ScreenMacroService;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IScreenMacroHandler _screenMacroHandler;

    public Worker(ILogger<Worker> logger, IScreenMacroHandler screenMacroHandler)
    {
        _logger = logger;
        _screenMacroHandler = screenMacroHandler;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _screenMacroHandler.Start();
        
        while (!stoppingToken.IsCancellationRequested)
        {
            _screenMacroHandler.ExecuteCommand();
            await Task.Delay(100, stoppingToken);
        }
    }
    
    public override void Dispose()
    {
        _screenMacroHandler.Dispose();
        base.Dispose();
    }
}