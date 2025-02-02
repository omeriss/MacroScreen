namespace Managers.Interfaces;

public interface IFileManager
{
    public bool UploadFile(string name, byte[] data);
    public List<string> Ls();
    public void LogFile(string name);
}