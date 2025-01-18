using System.Reflection;
using System.Text;
using Common.Attributes;
using Common.Exceptions;
using Common.Models;
using Managers.Interfaces;
using System.Linq;
using Common.Utils;

namespace Managers.Implementations;

public class ScreenMacroHandler(IComHandler com, IActions actions) : IScreenMacroHandler
{
    private IComHandler _com = com;
    private IActions _actions = actions;
    private Dictionary<CommandType, MethodInfo> _actionMethods = actions.GetType().GetMethods()
        .Where(m => m.GetCustomAttribute<CommandHandlerAttribute>() is not null)
        .ToDictionary(m => m.GetCustomAttribute<CommandHandlerAttribute>()!.Type, m => m);

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
    
    public void Dispose()
    {
        _com.Dispose();
    }
}