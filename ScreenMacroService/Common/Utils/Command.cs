using System.Diagnostics.CodeAnalysis;
using System.Text;
using Common.Models;

namespace Common.Utils;

public class Command(CommandType type, List<byte> payload)
{
    private static readonly Dictionary<Type, Action<Command, object>> TypeWriters = new()
    {
        { typeof(byte), (buf, val) => buf._payload.Add((byte)val) },
        { typeof(short), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((short)val)) },
        { typeof(int), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((int)val)) },
        { typeof(long), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((long)val)) },
        { typeof(float), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((float)val)) },
        { typeof(double), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((double)val)) },
        { typeof(ushort), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((ushort)val)) },
        { typeof(uint), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((uint)val)) },
        { typeof(ulong), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((ulong)val)) },
        { typeof(bool), (buf, val) => buf._payload.Add((byte)((bool)val ? 1 : 0)) },
        { typeof(char), (buf, val) => buf._payload.AddRange(BitConverter.GetBytes((char)val)) },
        { typeof(string), (buf, val) => buf.WriteString((string)val) },
    };
    
    private static T ReadPrimitive<T>(Command buf, int size, Func<byte[], int, T> converter)
    {
        T value = converter(buf._payload.ToArray(), buf._position);
        buf._position += size;
        
        return value;
    }
    
    private static readonly Dictionary<Type, Func<Command, object>> TypeReaders = new Dictionary<Type, Func<Command, object>>
    {
        { typeof(byte), buf => buf._payload[buf._position++] },
        { typeof(short), buf => ReadPrimitive<short>(buf, sizeof(short), BitConverter.ToInt16) },
        { typeof(int), buf => ReadPrimitive<int>(buf, sizeof(int), BitConverter.ToInt32) },
        { typeof(long), buf => ReadPrimitive<long>(buf, sizeof(long), BitConverter.ToInt64) },
        { typeof(float), buf => ReadPrimitive<float>(buf, sizeof(float), BitConverter.ToSingle) },
        { typeof(double), buf => ReadPrimitive<double>(buf, sizeof(double), BitConverter.ToDouble) },
        { typeof(ushort), buf => ReadPrimitive<ushort>(buf, sizeof(ushort), BitConverter.ToUInt16) },
        { typeof(uint), buf => ReadPrimitive<uint>(buf, sizeof(uint), BitConverter.ToUInt32) },
        { typeof(ulong), buf => ReadPrimitive<ulong>(buf, sizeof(ulong), BitConverter.ToUInt64) },
        { typeof(bool), buf => buf._payload[buf._position++] != 0 },
        { typeof(char), buf => ReadPrimitive<char>(buf, sizeof(char), BitConverter.ToChar) },
        { typeof(string), buf => buf.ReadString() }
    };
    public CommandType Type { get; set; } = type;
    private readonly List<byte> _payload = payload;
    private int _position = 0;

    public byte[] Payload => _payload.ToArray();

    public Command() : this(CommandType.NoData, [])
    {
    }

    public Command(CommandType type) : this(type, [])
    {
    }

    public Command(List<byte> payload) : this(CommandType.NoData, payload)
    {
    }

    public void Write<T>(T value)
    {
        if (TypeWriters.TryGetValue(typeof(T), out var writer))
            writer(this, value!);
        else
            throw new NotSupportedException($"Type {typeof(T)} is not supported.");
    }

    public void WriteString(string value)
    {
        byte[] stringBytes = Encoding.UTF8.GetBytes(value);
        Write((ushort)stringBytes.Length);
        _payload.AddRange(stringBytes);
    }

    public void WriteList<T>(IEnumerable<T> list) where T : struct
    {
        var enumerable = list.ToList();
        Write((ushort)enumerable.Count);
        
        foreach (T item in enumerable)
        {
            Write(item);
        }
    }
    
    public T Read<T>()
    {
        if (TypeReaders.TryGetValue(typeof(T), out var reader))
            return (T)reader(this);
        else
            throw new NotSupportedException($"Type {typeof(T)} is not supported.");
    }
    
    public string ReadString()
    {
        int length = Read<ushort>();
        string value = Encoding.UTF8.GetString(_payload.GetRange(_position, length).ToArray());
        _position += length;
        
        return value;
    }
    
    public List<T> ReadList<T>() where T : struct
    {
        int count = Read<ushort>();
        
        return Enumerable.Range(0, count).Select(_ => Read<T>()).ToList();
    }

    public void Reset()
    {
        _position = 0;
    }
    
    public bool IsEnd()
    {
        return _position >= _payload.Count;
    }
}