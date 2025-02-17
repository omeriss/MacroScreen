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
        lock (_comHandler.ReadLock)
        {
            if (!name.StartsWith("/")) name = $"/{name}";

            var chunks = data.Chunk(_fileSettings.ChunkSize);

            Command startCommand = new(CommandType.StartWriteFile);
            startCommand.Write((short)Math.Ceiling((double)data.Length / _fileSettings.ChunkSize));
            startCommand.Write(name);
            _comHandler.SendCommand(startCommand);
            if (!_comHandler.WaitForAck<short>(0)) return false;
            short index = 1;

            foreach (var chunk in chunks)
            {
                _comHandler.SendCommand(new Command(CommandType.SendFilePart, chunk.ToList()));
                if (!_comHandler.WaitForAck<short>(index)) return false;
                index++;
            }

            return true;
        }
    }

    public List<string> Ls()
    {
        lock (_comHandler.ReadLock)
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
    }
    
    public void LogFile(string name)
    {
        lock (_comHandler.ReadLock)
        {
            if (!name.StartsWith("/")) name = $"/{name}";

            Command logCommand = new(CommandType.LogFile);
            logCommand.Write(name);
            _comHandler.SendCommand(logCommand);

            Command response = _comHandler.GetCommand();
            if (response.Type != CommandType.Log) throw new CommandReadException("Invalid command type");

            Console.WriteLine(Encoding.UTF8.GetString(response.Payload));
        }
    }
    
    private bool DirAction(string name, CommandType type)
    {
        lock (_comHandler.ReadLock)
        {
            if (!name.StartsWith("/")) name = $"/{name}";

            Command mkdirCommand = new(type);
            mkdirCommand.Write(name);
            _comHandler.SendCommand(mkdirCommand);

            return _comHandler.WaitForAck(name);
        }
    }
    
    public bool MkDir(string name)
    {
        return DirAction(name, CommandType.MkDir);
    }
    
    public bool RmDir(string name)
    {
        return DirAction(name, CommandType.RmDir);
    }
}