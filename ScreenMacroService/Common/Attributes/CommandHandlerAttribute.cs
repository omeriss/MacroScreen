using Common.Models;

namespace Common.Attributes;

[AttributeUsage(AttributeTargets.Method)]
public class CommandHandlerAttribute(CommandType type) : Attribute
{
        public CommandType Type { get; set; } = type;
}