using System.Diagnostics;
using System.Text;
using Common.Attributes;
using Common.Models;
using Common.Utils;
using Managers.Interfaces;

namespace Managers.Implementations;

public class Actions(IStatisticsHandler statisticsHandler, IAudioHandler audioHandler) : IActions
{
    private readonly IStatisticsHandler _statisticsHandler = statisticsHandler;
    private readonly IAudioHandler _audioHandler = audioHandler;

    [CommandHandler(CommandType.Log)]
    public void Log(Command command)
    {
        Console.WriteLine(Encoding.UTF8.GetString(command.Payload));
    }
    
    private static string? FindLnkFile(string[] searchDirs, string input)
    {
        string[] allowedExtensions = { ".lnk", ".url" };
        
        foreach (var dir in searchDirs)
        {
            if (Directory.Exists(dir))
            {
                var lnkFile = Directory.GetFiles(dir)
                    .FirstOrDefault(f => allowedExtensions.Contains(Path.GetExtension(f)) && Path.GetFileNameWithoutExtension(f).Equals(input, StringComparison.OrdinalIgnoreCase));
                
                if (lnkFile is not null) return lnkFile;
                
                var subRes = FindLnkFile(Directory.GetDirectories(dir), input);
                
                if (subRes is not null) return subRes;
            }
        }

        return null;
    }

    [CommandHandler(CommandType.OpenProgram)]
    public void OpenProgram(Command command)
    {
        const string startMenuPath = @"Microsoft\Windows\Start Menu";
        const string programDataPath = "ProgramData";
        
        var path = Encoding.UTF8.GetString(command.Payload);

        if (File.Exists(path) && Path.GetExtension(path).Equals(".exe", StringComparison.OrdinalIgnoreCase))
        {
            Process.Start(path);
            return;
        }

        var lnkFile = FindLnkFile([
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), startMenuPath),
            Path.Combine(Path.GetPathRoot(AppDomain.CurrentDomain.BaseDirectory)!, programDataPath, startMenuPath)
        ], path);

        if (lnkFile is not null)
            Process.Start(new ProcessStartInfo()
            {
                FileName = lnkFile,
                UseShellExecute = true
            });
    }

    [CommandHandler(CommandType.StartStatistics)]
    public void StartStatistics(Command command)
    {
        _statisticsHandler.StartStatistics();
    }
    
    [CommandHandler(CommandType.StopStatistics)]
    public void StopStatistics(Command command)
    {
        _statisticsHandler.StopStatistics();
    }
    
    [CommandHandler(CommandType.StartAudio)]
    public void StartAudio(Command command)
    {
        _audioHandler.Start();
    }
    
    [CommandHandler(CommandType.StopAudio)]
    public void StopAudio(Command command)
    {
        _audioHandler.Stop();
    }
    
    [CommandHandler(CommandType.AudioAction)]
    public void AudioAction(Command command)
    {
        _audioHandler.AudioAction(command);
    }
    
    static void RunScript(string filePath)
    {
        ProcessStartInfo psi = new ProcessStartInfo();
        string extension = Path.GetExtension(filePath).ToLower();

        switch (extension)
        {
            case ".ps1":
                psi.FileName = "powershell";
                psi.Arguments = $"-ExecutionPolicy Bypass -File \"{filePath}\"";
                break;
            case ".bat":
                psi.FileName = "cmd.exe";
                psi.Arguments = $"/C \"{filePath}\"";
                break;
            case ".py":
                psi.FileName = "python"; // Ensure Python is in PATH
                psi.Arguments = $"\"{filePath}\"";
                break;
            case ".js":
                psi.FileName = "node"; // Ensure Node.js is installed
                psi.Arguments = $"\"{filePath}\"";
                break;
            default:
                Console.WriteLine($"Unsupported file type: {filePath}");
                return;
        }

        psi.UseShellExecute = false;
        psi.CreateNoWindow = true;
        psi.WindowStyle = ProcessWindowStyle.Hidden;

        Process.Start(psi);
    }

    [CommandHandler(CommandType.RunScript)]
    public void RunScript(Command command)
    {
        var path = Encoding.UTF8.GetString(command.Payload);
        RunScript(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            AppDomain.CurrentDomain.FriendlyName, path));
    }

    public void Dispose()
    {
        _statisticsHandler.Dispose();
        _audioHandler.Dispose();
    }
}