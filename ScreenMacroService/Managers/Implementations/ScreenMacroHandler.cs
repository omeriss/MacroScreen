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
        }
    }
    
    public void Start(bool retry = true)
    {
        const int retryDelay = 1000;
        
        do
        {
            try
            {
                _com.Start();
                break;
            }
            catch (Exception e)
            {
                if (!retry) throw;
                Console.WriteLine(e.Message);
                Thread.Sleep(retryDelay);
            }
        } while (retry);
    }

    public bool UploadCode(UploadConfig config)
    {
        var jsonPath = Path.Combine(config.UploadPath, _uploadSettings.JsonPath);
        var json = File.ReadAllText(jsonPath);

        var programDataPath = Path.Combine(config.UploadPath, _uploadSettings.ProgramDataPath);
        var programData = Directory.Exists(programDataPath) ? Directory.GetFiles(programDataPath) : [];
        
        var programDataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            AppDomain.CurrentDomain.FriendlyName);
        
        if (!Directory.Exists(programDataDir)) Directory.CreateDirectory(programDataDir);

        foreach (var file in programData)
        {
            File.Copy(file,
                Path.Combine(programDataDir, Path.GetFileName(file)), true);
        }

        var images = Directory.GetFiles(Path.Combine(config.UploadPath, _uploadSettings.ImagesPath));
        var usedImages = images.Where(f => json.Contains($"\"label\":\"/{Path.GetFileName(f)}\""));
        
        if (!fileManager.RmDir(_uploadSettings.ImagesPath) || !_fileManager.MkDir(_uploadSettings.ImagesPath)) return false;
        
        foreach (var image in usedImages)
        {
            var imgData = File.ReadAllBytes(image);
            if (!_fileManager.UploadFile($"{_uploadSettings.ImagesPath}/{Path.GetFileName(image)}", imgData)) return false;
        }
            
        var jsonBytes = Encoding.UTF8.GetBytes(json);
        if (!_fileManager.UploadFile(_uploadSettings.JsonPath, jsonBytes)) return false;

        return true;
    }
    
    public void Dispose()
    {
        _actions.Dispose();
        _com.Dispose();
    }
}