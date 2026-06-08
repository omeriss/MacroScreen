using System.Diagnostics;
using Managers.Interfaces;
using Windows.Media.Control;
using Windows.Storage.Streams;
using Common.Models;
using Common.Models.Settings;
using Common.Utils;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;

namespace Managers.Implementations;

public class AudioHandler(IConfiguration config, IFileManager fileManager, IComHandler comHandler) : IAudioHandler
{
    private Task? _processingTask;
    private CancellationTokenSource? _cancellationTokenSource;
    private GlobalSystemMediaTransportControlsSessionManager? _sessionManager;
    private string _lastTitle = "";
    private readonly AudioSettings _audioSettings = config.GetSection("Audio").Get<AudioSettings>()!;

    private Stopwatch? _watch = null;
    private long _lastSwap = 0;
    private GlobalSystemMediaTransportControlsSession? _currentSession = null;

    private readonly IFileManager _fileManager = fileManager;
    private readonly IComHandler _comHandler = comHandler;
    private readonly SemaphoreSlim _audioSessionLock = new SemaphoreSlim(1, 1);


    private GlobalSystemMediaTransportControlsSession? GetRunningSession()
    {
        var sessions = _sessionManager?.GetSessions() ?? [];
        int maxScore = -1;
        GlobalSystemMediaTransportControlsSession? maxSession = null;

        if (sessions.Count == 0) return null;

        foreach (var session in sessions)
        {
            int score = 0;
            if (session.GetPlaybackInfo().PlaybackStatus ==
                GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing)
                score += _audioSettings.PlayingRating;
            
            if (_currentSession is not null && session.SourceAppUserModelId == _currentSession.SourceAppUserModelId)
                score += _audioSettings.CurrentSessionRating;

            if (_audioSettings.PriorityServices.TryGetValue(session.SourceAppUserModelId, out int priority))
                score += priority;

            if (score > maxScore)
            {
                maxScore = score;
                maxSession = session;
            }
        }

        return maxScore <= 0 ? _sessionManager?.GetCurrentSession() : maxSession;
    }

    private async Task RunMediaUpdate(CancellationToken token)
    {
        bool fileUploaded = true;

        if (_currentSession is null || _watch!.ElapsedMilliseconds - _lastSwap > _audioSettings.SessionSwapRate)
        {
            var newSession = GetRunningSession();
            _currentSession = newSession;
            _lastSwap = _watch!.ElapsedMilliseconds;

            if (_currentSession is null) return;
        }
        
        var mediaProperties = await _currentSession.TryGetMediaPropertiesAsync();
        var time = _currentSession.GetTimelineProperties();
        bool mediaSwapped = mediaProperties.Title != _lastTitle;

        if (mediaSwapped)
        {
            var albumArt = mediaProperties.Thumbnail;

            if (albumArt != null)
            {
                using var stream = new MemoryStream();
                await albumArt.OpenReadAsync().AsTask(token).ContinueWith((readTask) =>
                {
                    IRandomAccessStreamWithContentType randomAccessStream = readTask.Result;
                    randomAccessStream.AsStreamForRead().CopyTo(stream);
                    stream.Position = 0;
                }, token);

                using var img = await Image.LoadAsync(stream, token);

                img.Mutate(x => x.Resize((int)((float)img.Width / (img.Height) * _audioSettings.ImageHeight),
                    _audioSettings.ImageHeight));

                using var outStream = new MemoryStream();
                await img.SaveAsPngAsync(outStream, token);
                byte[] outputBytes = outStream.ToArray();

                fileUploaded = _fileManager.UploadFile(_audioSettings.AudioImagePath, outputBytes);
            }
        }

        string title = mediaProperties.Title;
        string artist = mediaProperties.Artist;
        uint timeElapsed = (uint)time.Position.TotalMilliseconds;
        uint totalTime = (uint)time.EndTime.TotalMilliseconds;

        Command command = new Command()
        {
            Type = CommandType.SendAudio
        };

        command.Write(mediaSwapped);
        command.Write(_currentSession.GetPlaybackInfo().PlaybackStatus == 
                      GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing); 
        command.Write(timeElapsed);
        command.Write(totalTime);
        
        Console.WriteLine($"Title: {title}, Artist: {artist}, Time: {timeElapsed/1000%60}/{totalTime/1000%60}");
        
        if (mediaSwapped)
        {
            command.Write(title);
            command.Write(artist);
        }

        _comHandler.SendCommand(command);

        _lastTitle = !fileUploaded ? "" : title;
    }

    private async Task OutputThreadProc(CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            try
            {
                try
                {
                    await _audioSessionLock.WaitAsync(token);
                    await RunMediaUpdate(token);
                }
                finally
                {
                    _audioSessionLock.Release();
                }

                await Task.Delay(_audioSettings.RefreshRate, token);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch
            {
                // ignored
            }
        }
    }

    public async Task Start()
    {
        if (_processingTask != null) return;
        
        _sessionManager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
        _watch = new Stopwatch();
        _watch.Start();
        _lastSwap = 0;
        _currentSession = null;
        
        _cancellationTokenSource = new CancellationTokenSource();
        
        
        _processingTask = Task.Run(() => OutputThreadProc(_cancellationTokenSource.Token));
    }
    public void Stop()
    {
        _cancellationTokenSource?.Cancel();
        _cancellationTokenSource?.Dispose();
        
        try
        {
            _processingTask?.Wait();
        }
        catch (OperationCanceledException)
        {
        }
        
        _sessionManager = null;
        _cancellationTokenSource = null;
        _processingTask = null;
        _lastTitle = "";
    }

    private enum AudioActionType : byte
    {
        Pause,
        Play,
        Previous,
        Next
    }

    public async Task AudioAction(Command command)
    {
        AudioActionType action = (AudioActionType)command.Read<byte>();

        try
        {
            await _audioSessionLock.WaitAsync();

            switch (action)
            {
                case AudioActionType.Play:
                    await _currentSession?.TryPlayAsync();
                    break;
                case AudioActionType.Pause:
                    await _currentSession?.TryPauseAsync();
                    break;
                case AudioActionType.Next:
                    await _currentSession?.TrySkipNextAsync();
                    break;
                case AudioActionType.Previous:
                    await _currentSession?.TrySkipPreviousAsync();
                    break;
            }
        }
        finally
        {
            _audioSessionLock.Release();
        }
    }

    public void Dispose()
    {
        Stop();
    }
}