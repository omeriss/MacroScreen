using System.Reflection;
using System.Text;
using Common.Attributes;
using Common.Exceptions;
using Common.Models;
using Managers.Interfaces;
using System.Linq;
using Common.Models.Settings;
using Common.Utils;
using Microsoft.Extensions.Configuration;

namespace Managers.Implementations;

public class ScreenMacroHandler(IComHandler com, IActions actions, IConfiguration config, IFileManager fileManager) : IScreenMacroHandler
{
    private readonly IComHandler _com = com;
    private readonly IActions _actions = actions;
    private Dictionary<CommandType, MethodInfo> _actionMethods = actions.GetType().GetMethods()
        .Where(m => m.GetCustomAttribute<CommandHandlerAttribute>() is not null)
        .ToDictionary(m => m.GetCustomAttribute<CommandHandlerAttribute>()!.Type, m => m);
    private readonly UploadSettings _uploadSettings = config.GetSection("Upload").Get<UploadSettings>()!;
    private readonly IFileManager _fileManager = fileManager;

    public void ExecuteCommand()
    {
        try
        {
            var command = _com.GetCommand();
            var method = _actionMethods.GetValueOrDefault(command.Type);
            if (method is null) return;
            
            method.Invoke(_actions, new object[] { command });
        }
        catch (CommandReadException e)
        {
            Console.WriteLine(e.Message);
        }
    }
    
    public void Start(bool retry = true)
    {
        const int retryDelay = 1000;
        
        while (retry)
        {
            try
            {
                _com.Start();
                break;
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                Thread.Sleep(retryDelay);
            }
        }
    }

    public bool UploadCode(UploadConfig config)
    {
        var jsonPath = Path.Combine(config.UploadPath, _uploadSettings.JsonPath);
        var json = File.ReadAllText(jsonPath);
        var code = Encoding.ASCII.GetBytes(json);

        if (!_fileManager.UploadFile(_uploadSettings.JsonPath, code)) return false;
        _fileManager.LogFile(_uploadSettings.JsonPath);

        return true;
    }
    
    public void Dispose()
    {
        _com.Dispose();
    }
}