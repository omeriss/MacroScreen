using System.Data;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using System.IO.Ports;
using System.Management;
using System.Runtime.Versioning;
using System.Text;
using Common.Exceptions;
using Common.Models;
using Common.Models.Settings;
using Common.Utils;
using Managers.Interfaces;
using Microsoft.Extensions.Configuration;
using CommandType = Common.Models.CommandType;

namespace Managers.Implementations;

public class ComHandler(IConfiguration configuration) : IComHandler
{
    private SerialPort? _serialPort = null;
    private readonly ComSettings _comSettings = configuration.GetSection("Com").Get<ComSettings>()!;
    
    const int StartByte = 0x7E;
    const int EndByte = 0x7F;
    const int EscapeByte = 0x7D;

    private static string? FindSerialPort(int vid, int pid)
    {
        var query = new ManagementObjectSearcher("SELECT * FROM Win32_PnPEntity");
        
        foreach (var device in query.Get())
        {
            string deviceId = device["DeviceID"]?.ToString() ?? "";
            if (deviceId.Contains($"VID_{vid:X4}") && deviceId.Contains($"PID_{pid:X4}"))
            {
                string? name = device["Name"]?.ToString();
                if (name?.Contains("(COM") ?? false)
                    return name[(name.LastIndexOf("(COM") + 1)..].Trim('(', ')');
            }
        }

        return null;
    }
    
    private int ReadByteCheckSum(ref int checksum)
    {
        int b = _serialPort!.ReadByte();
        
        if (b is StartByte or EndByte)
            throw new CommandReadException("Invalid byte");
        if (b == EscapeByte)
        {
            b = _serialPort.ReadByte();
            checksum ^= b;
            b ^= 0x20;
        }
        else
            checksum ^= b;
        
        return b;
    }

    public Command GetCommand()
    {
        if (_serialPort is null) throw new SerialPortException("Serial port not open");

        try
        {
            while (_serialPort.ReadByte() != StartByte)
            {
            }

            int checksum = 0;

            int typeData = ReadByteCheckSum(ref checksum);
            
            if (!Enum.IsDefined(typeof(CommandType), typeData)) throw new CommandReadException("Invalid command type");
            
            int length = ReadByteCheckSum(ref checksum) << 8 | ReadByteCheckSum(ref checksum);

            List<byte> payload = new(length);

            for (int i = 0; i < length; i++)
            {
                int b = ReadByteCheckSum(ref checksum);
                payload.Add((byte)b);
            }

            int receivedChecksum = ReadByteCheckSum(ref checksum);

            if (checksum != 0) throw new CommandReadException("Checksum mismatch");

            if (_serialPort.ReadByte() != EndByte) throw new CommandReadException("End byte mismatch");

            return new Command((CommandType)typeData, payload);
        }
        catch (TimeoutException)
        {
            throw new CommandReadException("Timeout");
        }
    }
    
    public void AddByteCheckSum(List<byte> bytes, int b, ref int checksum)
    {
        if (b is StartByte or EndByte or EscapeByte)
        {
            bytes.Add(EscapeByte);
            b ^= 0x20;
        }

        bytes.Add((byte)b);
        checksum ^= b;
    }

    public void SendCommand(Command command)
    {
        if (_serialPort is null) throw new SerialPortException("Serial port not open");
        
        List<byte> bytes = new();
        int checksum = 0;

        bytes.Add(StartByte);
        AddByteCheckSum(bytes, (int)command.Type, ref checksum);
        AddByteCheckSum(bytes, command.Payload.Length >> 8, ref checksum);
        AddByteCheckSum(bytes, command.Payload.Length & 0xFF, ref checksum);

        foreach (byte b in command.Payload)
        {
            AddByteCheckSum(bytes, b, ref checksum);
        }

        bytes.Add((byte)checksum);
        bytes.Add(EndByte);
        
        _serialPort.Write(bytes.ToArray(), 0, bytes.Count);
    }

    public bool WaitForAck(int id)
    {
        if (_serialPort is null) throw new SerialPortException("Serial port not open");

        Stopwatch stopwatch = new();
        stopwatch.Start();

        while (stopwatch.ElapsedMilliseconds < _comSettings.AckTimeout)
        {
            try
            {
                var command = GetCommand();
                if (command.Type == CommandType.Acknowledge && id == command.Read<short>())
                    return true;
                if (command.Type == CommandType.Log)
                    Console.WriteLine(Encoding.UTF8.GetString(command.Payload));
            }
            catch (CommandReadException) { }
        }

        return false;
    }

    public void Start()
    {
        string portName = FindSerialPort(_comSettings.Vid, _comSettings.Pid) ?? throw new DeviceNotFoundException("Device not found");

        _serialPort = new SerialPort(portName, _comSettings.BaudRate);
        _serialPort.ReadTimeout = _comSettings.ReadTimeout;
        _serialPort.DtrEnable = true;
        _serialPort.RtsEnable = true;

        _serialPort.Open();
    }
    
    public void Stop()
    {
        Dispose();
    }
    
    public void Dispose()
    {
        _serialPort?.Close();
        _serialPort = null;
    }
}