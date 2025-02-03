using System.Text;
using Common.Exceptions;
using Common.Models;
using Common.Models.Settings;
using Common.Utils;
using Managers.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Managers.Implementations;

public class FileManager(IConfiguration config, IComHandler comHandler) : IFileManager
{
    private readonly FileSettings _fileSettings = config.GetSection("File").Get<FileSettings>()!;
    private readonly IComHandler _comHandler = comHandler;
    
    public bool UploadFile(string name, byte[] data)
    {
        if(!name.StartsWith("/")) name = $"/{name}";
        
        var chunks = data.Chunk(_fileSettings.ChunkSize);
        
        Command startCommand = new(CommandType.StartWriteFile);
        startCommand.Write((short)Math.Ceiling((double)data.Length / _fileSettings.ChunkSize));
        startCommand.Write(name);
        _comHandler.SendCommand(startCommand);
        if(!_comHandler.WaitForAck(0)) return false;
        int index = 1;
        
        foreach (var chunk in chunks)
        {
            _comHandler.SendCommand(new Command(CommandType.SendFilePart, chunk.ToList()));
            if(!_comHandler.WaitForAck(index)) return false;
            index++;
        }
        
        return true;
    }

    public List<string> Ls()
    {
        Command lsCommand = new(CommandType.Ls);
        _comHandler.SendCommand(lsCommand);
        
        Command response = _comHandler.GetCommand();
        if (response.Type != CommandType.Ls) throw new CommandReadException("Invalid command type");
        
        List<string> files = new();
        
        while (!response.IsEnd())
        {
            files.Add(response.ReadString());
        }
        
        return files;
    }
    
    public void LogFile(string name)
    {
        if(!name.StartsWith("/")) name = $"/{name}";
        
        Command logCommand = new(CommandType.LogFile);
        logCommand.Write(name);
        _comHandler.SendCommand(logCommand);
        
        Command response = _comHandler.GetCommand();
        if (response.Type != CommandType.Log) throw new CommandReadException("Invalid command type");
        
        Console.WriteLine(Encoding.UTF8.GetString(response.Payload));
    }
}