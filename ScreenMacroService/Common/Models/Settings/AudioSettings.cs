namespace Common.Models.Settings;

public class AudioSettings
{
    public required Dictionary<string, int> PriorityServices { get; set; }
    public int PlayingRating { get; set; }
    public int CurrentSessionRating { get; set; }
    public int RefreshRate { get; set; }
    public int SessionSwapRate { get; set; }
    public int ImageHeight { get; set; }
    public required string AudioImagePath { get; set; }
}